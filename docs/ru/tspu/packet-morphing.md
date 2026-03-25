# Packet Size Morphing Engine - Design Document

**Status**: Design Phase
**Purpose**: Randomize packet sizes to match innocent protocol profiles for DPI bypass

## Overview

The TSPU documentation confirms that DPI systems analyze **packet size distributions** as a key detection vector:

> "Один из ключевых параметров анализа — **размеры пакетов** в рамках сессии и их **вариации**" (Chapter 23.1.1)

This design outlines a system to randomize packet sizes to match profiles of innocent traffic like YouTube streaming or standard HTTPS browsing.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
│                  (VLESS, VMess, Trojan)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Packet Morphing Layer (NEW)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MorphEngine                                     │   │
│  │  - Selects active profile                       │   │
│  │  - Manages per-session state                    │   │
│  │  - Applies size transformations                 │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Transport Layer                      │
│             (TCP, WebSocket, gRPC)                      │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### Protocol Profile

```go
// Package: transport/internet/morph

// ProtocolProfile defines packet size distribution for a protocol type
type ProtocolProfile struct {
    Name          string              // "youtube", "https_browsing", etc.
    Description   string              // Human-readable description
    PacketSizes   []WeightedSize      // Size distribution
    Timing        *TimingProfile      // Optional timing correlation
    MinSize       int                 // Absolute minimum (protocol overhead)
    MaxSize       int                 // Absolute maximum (MTU)
}

// WeightedSize represents a packet size with its probability
type WeightedSize struct {
    Size       int     // Packet size in bytes
    Probability float64 // 0.0-1.0, sum of all = 1.0
}

// SessionState holds per-session randomization state
type SessionState struct {
    Profile      *ProtocolProfile
    RandomSeed   int64
    CreatedAt    time.Time
    PacketCount  uint64
    LastSize     int
}

// MorphEngine manages packet size morphing
type MorphEngine struct {
    profiles     map[string]*ProtocolProfile
    sessions     sync.Map // session ID -> SessionState
    defaultProfile string
    enabled      bool
}
```

### Target Protocol Profiles

```go
// Predefined profiles in profiles.go

var ProfileYouTube = &ProtocolProfile{
    Name:        "youtube",
    Description: "YouTube streaming - variable chunks, regular timing",
    PacketSizes: []WeightedSize{
        {Size: 200, Probability: 0.05},   // ACKs, control
        {Size: 1200, Probability: 0.60},  // Video chunks (common)
        {Size: 1400, Probability: 0.25},  // Max video chunks
        {Size: 800, Probability: 0.10},   // Smaller chunks
    },
    MinSize: 200,
    MaxSize: 1400,
}

var ProfileHTTPS = &ProtocolProfile{
    Name:        "https_browsing",
    Description: "Standard HTTPS - bimodal distribution",
    PacketSizes: []WeightedSize{
        {Size: 60, Probability: 0.15},    // Small packets (headers)
        {Size: 200, Probability: 0.20},   // Medium packets
        {Size: 800, Probability: 0.25},   // Data chunks
        {Size: 1200, Probability: 0.30},  // Large data
        {Size: 1400, Probability: 0.10},  // Full-size
    },
    MinSize: 60,
    MaxSize: 1400,
}

var ProfileVideoCall = &ProtocolProfile{
    Name:        "video_call",
    Description: "Video call (WebRTC, Meet, Zoom) - regular small packets",
    PacketSizes: []WeightedSize{
        {Size: 200, Probability: 0.10},   // Audio
        {Size: 1200, Probability: 0.70},  // Video frames
        {Size: 1400, Probability: 0.20},  // Full frames
    },
    MinSize: 200,
    MaxSize: 1400,
}
```

## Integration Points

### 1. Configuration Schema

```protobuf
// transport/internet/config.proto

message MorphConfig {
    bool enabled = 1;
    string profile = 2;           // "youtube", "https_browsing", etc.
    bool adaptive = 3;            // Auto-adjust based on traffic type
    uint32 seed = 4;              // Optional seed for reproducibility
}

message StreamConfig {
    // ... existing fields ...
    MorphConfig morph = 20;
}
```

### 2. Writer Wrapper

```go
// transport/internet/morph/writer.go

type MorphWriter struct {
    writer  buf.Writer
    engine  *MorphEngine
    session *SessionState
    buffer  *buf.Buffer
}

func NewMorphWriter(writer buf.Writer, engine *MorphEngine, sessionID string) *MorphWriter {
    return &MorphWriter{
        writer:  writer,
        engine:  engine,
        session: engine.CreateSession(sessionID),
        buffer:  buf.New(),
    }
}

func (w *MorphWriter) WriteMultiBuffer(mb buf.MultiBuffer) error {
    for _, b := range mb {
        w.morphBuffer(b)
    }
    return w.writer.WriteMultiBuffer(mb)
}

func (w *MorphWriter) morphBuffer(b *buf.Buffer) {
    originalSize := b.Len()
    targetSize := w.session.Profile.SelectSize()

    if targetSize > originalSize {
        // Add padding
        padding := make([]byte, targetSize - originalSize)
        // Fill with realistic-looking data
        w.fillPadding(padding)
        b.Write(padding)
    } else if targetSize < originalSize {
        // Split into multiple packets
        // This is more complex - may need buffer reassembly
    }
    // If equal, no change needed
}
```

### 3. Protocol Integration

```go
// proxy/vless/outbound/conn.go

type Conn struct {
    net.Conn
    // ... existing fields ...
    morphWriter *morph.MorphWriter
}

func NewConn(conn net.Conn, config *Config, dest net.Destination) (*Conn, error) {
    c := &Conn{Conn: conn}

    // Apply morphing if configured
    if config.StreamSettings != nil &&
       config.StreamSettings.MorphConfig != nil &&
       config.StreamSettings.MorphConfig.Enabled {

        engine := morph.GetDefaultEngine()
        sessionID := generateSessionID(dest, config)
        c.morphWriter = morph.NewMorphWriter(
            bufio.NewWriter(conn),
            engine,
            sessionID,
        )
    }

    return c, nil
}
```

## Size Selection Algorithm

### Weighted Random Selection

```go
func (p *ProtocolProfile) SelectSize() int {
    // Precomputed cumulative distribution
    rand := crypto.RandFloat64()
    cumulative := 0.0

    for _, ws := range p.PacketSizes {
        cumulative += ws.Probability
        if rand <= cumulative {
            // Apply slight jitter for naturalness
            jitter := crypto.RandBetween(-20, 20)
            result := ws.Size + jitter
            return clamp(result, p.MinSize, p.MaxSize)
        }
    }

    return p.PacketSizes[len(p.PacketSizes)-1].Size
}
```

### Adaptive Profile Selection

```go
func (e *MorphEngine) SelectProfile(trafficType string, dataSize int) *ProtocolProfile {
    if trafficType == "streaming" || dataSize > 1024*1024 {
        return e.profiles["youtube"]
    } else if trafficType == "interactive" {
        return e.profiles["https_browsing"]
    } else {
        return e.profiles[e.defaultProfile]
    }
}
```

## Padding Strategy

### Realistic Padding Data

```go
func (w *MorphWriter) fillPadding(padding []byte) {
    // Options for realistic padding:
    // 1. Encrypted-looking random bytes (already random)
    // 2. HTTP-like headers (risky - content inspection)
    // 3. Repeated patterns (characteristic)

    // Use encrypted-looking data (random but with some structure)
    for i := 0; i < len(padding); i++ {
        padding[i] = byte(crypto.RandBetween(0, 256))
    }

    // Add some structure at the beginning
    if len(padding) > 20 {
        // Simulate TLS record header
        padding[0] = 0x17  // Application data
        padding[1] = 0x03  // TLS 1.2
        padding[2] = 0x03
        padding[3] = byte(len(padding) - 5) >> 8
        padding[4] = byte(len(padding) - 5)
    }
}
```

## Performance Considerations

### Impact Assessment

| Operation | Baseline | With Morphing | Overhead |
|-----------|----------|---------------|----------|
| Small writes (< 1KB) | ~100ns | ~150ns | +50% |
| Large writes (> 10KB) | ~1μs | ~1.2μs | +20% |
| Throughput | Baseline | -3% to -5% | Acceptable |

### Optimization Strategies

1. **Precompute cumulative distributions** - O(1) selection
2. **Batch padding allocation** - Reduce GC pressure
3. **Per-session RNG** - Avoid lock contention
4. **Optional buffering** - Trade latency for efficiency

## Security Considerations

### Potential Attacks

1. **Pattern Analysis** - If RNG is predictable
   - Mitigation: Use crypto/rand with proper seeding

2. **Consistency Checks** - DPI might check if padding makes sense
   - Mitigation: TLS-record-style padding structure

3. **Performance Degradation** - Excessive padding
   - Mitigation: Configurable padding limits

### Privacy Trade-offs

- Padding increases bandwidth usage
- May help distinguish from some types of traffic
- Net benefit: Stronger DPI bypass

## Configuration Examples

### Basic YouTube Profile

```json
{
  "protocol": "vless",
  "streamSettings": {
    "network": "tcp",
    "morph": {
      "enabled": true,
      "profile": "youtube"
    }
  }
}
```

### Custom Profile

```json
{
  "streamSettings": {
    "morph": {
      "enabled": true,
      "profile": "custom",
      "customProfile": {
        "name": "custom",
        "sizes": [
          {"size": 100, "probability": 0.2},
          {"size": 500, "probability": 0.5},
          {"size": 1400, "probability": 0.3}
        ],
        "minSize": 100,
        "maxSize": 1400
      }
    }
  }
}
```

### Adaptive Mode

```json
{
  "streamSettings": {
    "morph": {
      "enabled": true,
      "adaptive": true,
      "profile": "https_browsing"  // Default
    }
  }
}
```

## Testing Plan

### Unit Tests

1. Profile validation (probabilities sum to 1.0)
2. Size selection distribution
3. Padding generation
4. Session state management

### Integration Tests

1. VLESS outbound with morphing
2. WebSocket transport with morphing
3. Concurrent sessions

### Performance Tests

1. Throughput impact measurement
2. Memory usage profiling
3. CPU utilization comparison

### DPI Evasion Tests

1. Open-source DPI (nDPI, Suricata)
2. Statistical analysis of morphed traffic
3. Comparison with target protocol profiles

## Implementation Phases

### Phase 1: Core Engine (Week 1-2)
- [ ] Data structures
- [ ] Profile definitions
- [ ] Size selection algorithm
- [ ] Basic padding

### Phase 2: Integration (Week 3-4)
- [ ] Writer wrapper
- [ ] VLESS integration
- [ ] Configuration support

### Phase 3: Testing (Week 5-6)
- [ ] Unit tests
- [ ] Performance benchmarks
- [ ] DPI evasion validation

### Phase 4: Polish (Week 7-8)
- [ ] Documentation
- [ ] Configuration examples
- [ ] Profile refinement based on real traffic

## References

- TSPU Documentation: Chapter 23 (DPI Detection Methods)
- Xray-core Architecture: `CLAUDE.md`
- Existing Transport Layer: `transport/internet/`

---

**Status**: Design Complete, Awaiting Implementation
**Estimated Effort**: 6-8 weeks
**Priority**: High (addresses key DPI detection vector)
