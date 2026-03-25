# Timing Pattern Randomization - Design Document

**Status**: Design Phase
**Purpose**: Add realistic timing jitter to break DPI statistical analysis of inter-packet timing

## Overview

The TSPU documentation confirms that DPI systems analyze **timing patterns** as a key detection vector:

> "**Частота прохождения пакетов** — ещё один важный параметр" (Chapter 23.1.2)
> "Голосовые вызовы генерируют поток пакетов с **регулярными короткими интервалами**" (Chapter 23.1.2)

This design outlines a system to randomize inter-packet timing to match profiles of innocent traffic.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
│                  (VLESS, VMess, Trojan)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Timing Morphing Layer (NEW)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  TimingEngine                                     │   │
│  │  - Manages jitter profiles                       │   │
│  │  - Delays packet writes                          │   │
│  │  - Generates burst patterns                      │   │
│  │  - Per-session adaptive timing                   │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Packet Morphing Layer                       │
│           (Size Randomization - see separate doc)        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Transport Layer                      │
│             (TCP, WebSocket, gRPC)                      │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### Timing Profile

```go
// Package: transport/internet/morph/timing

import (
    "time"
    "math"
)

// TimingProfile defines inter-packet timing behavior
type TimingProfile struct {
    Name           string
    Description    string

    // Basic jitter settings
    MinInterval    time.Duration  // Minimum delay between packets
    MaxInterval    time.Duration  // Maximum delay between packets
    Distribution   DistributionType // How to select intervals

    // Burst behavior
    BurstPattern   *BurstConfig   // Optional burst behavior
    BurstsEnabled  bool

    // Adaptive settings
    Adaptive       bool           // Adjust based on traffic type
    MinResponse    time.Duration  // Minimum for interactive traffic
}

type DistributionType int

const (
    Uniform DistributionType = iota
    Gaussian
    Exponential
    Bimodal       // For protocols with two timing modes
)

// BurstConfig defines burst-style packet sending
type BurstConfig struct {
    PacketsPerBurst    int           // How many packets in a burst
    BurstInterval      time.Duration // Delay within burst
    InterBurstInterval time.Duration // Delay between bursts
    BurstCount         int           // Number of bursts (0 = infinite)
}

// SessionTimingState holds per-session timing state
type SessionTimingState struct {
    Profile        *TimingProfile
    LastPacketTime time.Time
    PacketCount    uint64
    BurstRemaining int
    InBurst        bool
}

// TimingEngine manages timing randomization
type TimingEngine struct {
    profiles       map[string]*TimingProfile
    sessions       sync.Map
    defaultProfile string
    enabled        bool
    maxDelay       time.Duration  // Safety limit
}
```

### Predefined Timing Profiles

```go
// profiles.go

var ProfileYouTubeTiming = &TimingProfile{
    Name:        "youtube_streaming",
    Description: "Regular intervals ~20ms (video frame timing)",
    MinInterval: 15 * time.Millisecond,
    MaxInterval: 25 * time.Millisecond,
    Distribution: Gaussian,
    BurstsEnabled: false,
}

var ProfileHTTPSBrowsing = &TimingProfile{
    Name:        "https_browsing",
    Description: "Irregular - page load patterns",
    MinInterval: 1 * time.Millisecond,
    MaxInterval: 200 * time.Millisecond,
    Distribution: Exponential,  // Many packets close together, some far apart
    BurstsEnabled: true,
    BurstPattern: &BurstConfig{
        PacketsPerBurst:    5,
        BurstInterval:      2 * time.Millisecond,
        InterBurstInterval: 50 * time.Millisecond,
        BurstCount:         3,
    },
}

var ProfileVideoCall = &TimingProfile{
    Name:        "video_call",
    Description: "Very regular, small intervals",
    MinInterval: 18 * time.Millisecond,
    MaxInterval: 22 * time.Millisecond,
    Distribution: Gaussian,
    Adaptive:     true,
    MinResponse:  10 * time.Millisecond,  // For audio packets
}

var ProfileInteractive = &TimingProfile{
    Name:        "interactive_ssh",
    Description: "Interactive terminal - very irregular",
    MinInterval: 0,
    MaxInterval: 500 * time.Millisecond,
    Distribution: Bimodal,  // Either very fast (typing) or very slow (thinking)
}
```

## Distribution Algorithms

### Gaussian (Normal) Distribution

```go
func (e *TimingEngine) gaussianInterval(profile *TimingProfile) time.Duration {
    mean := (profile.MinInterval + profile.MaxInterval) / 2
    stdDev := (profile.MaxInterval - profile.MinInterval) / 6  // 99.7% within range

    // Box-Muller transform for normal distribution
    u1 := rand.Float64()
    u2 := rand.Float64()
    z0 := math.Sqrt(-2 * math.Log(u1)) * math.Cos(2 * math.Pi * u2)

    interval := mean + time.Duration(z0 * float64(stdDev))

    // Clamp to range
    if interval < profile.MinInterval {
        interval = profile.MinInterval
    } else if interval > profile.MaxInterval {
        interval = profile.MaxInterval
    }

    return interval
}
```

### Exponential Distribution

```go
func (e *TimingEngine) exponentialInterval(profile *TimingProfile) time.Duration {
    lambda := 1.0 / profile.MaxInterval.Seconds()
    u := rand.Float64()

    // Exponential distribution: f(x) = λ * e^(-λx)
    intervalSec := -math.Log(1 - u) / lambda
    interval := time.Duration(intervalSec * float64(time.Second))

    // Clamp to minimum
    if interval < profile.MinInterval {
        interval = profile.MinInterval
    }

    return interval
}
```

### Bimodal Distribution

```go
func (e *TimingEngine) bimodalInterval(profile *TimingProfile) time.Duration {
    // 40% chance of very short interval (burst mode)
    // 60% chance of longer interval (idle mode)

    if rand.Float64() < 0.4 {
        // Burst mode: 0-5ms
        return time.Duration(rand.Int63n(int64(5 * time.Millisecond)))
    } else {
        // Idle mode: 50-500ms
        return 50*time.Millisecond + time.Duration(rand.Int63n(int64(450*time.Millisecond)))
    }
}
```

## Integration with Write Path

### Timing-Aware Writer

```go
// transport/internet/morph/timing/writer.go

type TimingWriter struct {
    writer  buf.Writer
    engine  *TimingEngine
    session *SessionTimingState
    timer   *time.Timer
}

func NewTimingWriter(writer buf.Writer, engine *TimingEngine, sessionID string) *TimingWriter {
    return &TimingWriter{
        writer:  writer,
        engine:  engine,
        session: engine.CreateSession(sessionID),
    }
}

func (w *TimingWriter) WriteMultiBuffer(mb buf.MultiBuffer) error {
    for _, b := range mb {
        w.applyTiming(b)
    }

    return w.writer.WriteMultiBuffer(mb)
}

func (w *TimingWriter) applyTiming(b *buf.Buffer) {
    interval := w.calculateDelay()

    if interval > 0 {
        // Sleep before writing
        time.Sleep(interval)
    }

    w.session.LastPacketTime = time.Now()
    w.session.PacketCount++
}

func (w *TimingWriter) calculateDelay() time.Duration {
    profile := w.session.Profile

    // Check if in burst mode
    if profile.BurstPattern != nil && w.session.BurstRemaining > 0 {
        w.session.BurstRemaining--
        w.session.InBurst = true
        return profile.BurstPattern.BurstInterval
    }

    // Between bursts or no burst pattern
    if profile.BurstPattern != nil && w.session.BurstRemaining == 0 && w.session.InBurst {
        // Just finished a burst
        w.session.InBurst = false
        w.session.BurstRemaining = profile.BurstPattern.PacketsPerBurst
        return profile.BurstPattern.InterBurstInterval
    }

    // Calculate interval based on distribution
    switch profile.Distribution {
    case Gaussian:
        return w.engine.gaussianInterval(profile)
    case Exponential:
        return w.engine.exponentialInterval(profile)
    case Bimodal:
        return w.engine.bimodalInterval(profile)
    default: // Uniform
        min := profile.MinInterval
        max := profile.MaxInterval
        return min + time.Duration(rand.Int63n(int64(max-min)))
    }
}
```

### Adaptive Timing for Traffic Type

```go
func (e *TimingEngine) SelectProfileForTraffic(trafficType string, dataSize int) *TimingProfile {
    switch trafficType {
    case "streaming":
        if dataSize > 1024*1024 { // > 1MB
            return e.profiles["youtube_streaming"]
        }
        return e.profiles["https_browsing"]

    case "interactive":
        return e.profiles["interactive_ssh"]

    case "voip":
        return e.profiles["video_call"]

    default:
        return e.profiles[e.defaultProfile]
    }
}
```

## Configuration Schema

```protobuf
// transport/internet/config.proto

message TimingConfig {
    bool enabled = 1;
    string profile = 2;           // "youtube", "https_browsing", etc.
    int32 max_delay_ms = 3;       // Safety limit (default: 500ms)
    bool adaptive = 4;            // Auto-adjust based on traffic
    bool preserve_interactive = 5; // Fast response for interactive traffic
}

message BurstConfig {
    int32 packets_per_burst = 1;
    int32 burst_interval_ms = 2;
    int32 inter_burst_interval_ms = 3;
    int32 burst_count = 4;
}

message MorphConfig {
    // ... existing packet size config ...
    TimingConfig timing = 10;
}
```

## Configuration Examples

### Basic YouTube Timing

```json
{
  "streamSettings": {
    "morph": {
      "enabled": true,
      "timing": {
        "enabled": true,
        "profile": "youtube_streaming",
        "max_delay_ms": 50
      }
    }
  }
}
```

### HTTPS Browsing with Bursts

```json
{
  "streamSettings": {
    "morph": {
      "enabled": true,
      "timing": {
        "enabled": true,
        "profile": "https_browsing",
        "adaptive": true
      }
    }
  }
}
```

### Custom Burst Pattern

```json
{
  "streamSettings": {
    "morph": {
      "enabled": true,
      "timing": {
        "enabled": true,
        "profile": "custom",
        "burst": {
          "packets_per_burst": 10,
          "burst_interval_ms": 1,
          "inter_burst_interval_ms": 100,
          "burst_count": 5
        },
        "max_delay_ms": 200
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
      "timing": {
        "enabled": true,
        "adaptive": true,
        "preserve_interactive": true,
        "max_delay_ms": 500
      }
    }
  }
}
```

## Performance Considerations

### Latency Impact

| Mode | Added Latency | Throughput Impact |
|------|---------------|-------------------|
| Off | 0 | 0% |
| Conservative | < 5ms | < 2% |
| Moderate | 5-20ms | 5-10% |
| Aggressive | 20-100ms | 10-20% |

### Interactive Traffic Preservation

For interactive applications (SSH, terminal), timing randomization can significantly impact user experience:

```go
func (w *TimingWriter) WriteMultiBuffer(mb buf.MultiBuffer) error {
    // Check if buffer contains interactive data
    if w.isInteractiveTraffic(mb) && w.session.Profile.Adaptive {
        // Use minimal delay for interactive traffic
        w.applyTiming(mb, w.session.Profile.MinResponse)
    } else {
        w.applyTiming(mb, w.calculateDelay())
    }

    return w.writer.WriteMultiBuffer(mb)
}
```

### Optimization Strategies

1. **Batching** - Group small writes together
2. **Asynchronous delays** - Use goroutines for non-blocking timing
3. **Profile caching** - Precompute distributions
4. **Adaptive thresholds** - Reduce jitter for high-throughput streams

## Security Analysis

### Timing Fingerprint Resistance

The TSPU documentation notes:
> "Голосовые вызовы генерируют поток пакетов с регулярными короткими интервалами"

By adding realistic jitter, we:
1. Break the "regular interval" signature
2. Match innocent traffic patterns
3. Make statistical analysis harder

### Potential Weaknesses

1. **Overly regular artificial jitter** - Could create new signature
   - Mitigation: Use proper statistical distributions

2. **Inconsistent with packet sizes** - Timing should correlate with sizes
   - Mitigation: Coordinate with size morphing engine

3. **Performance degradation** - May affect user experience
   - Mitigation: Adaptive mode and configurable limits

### Correlation with Size Morphing

For maximum effectiveness, timing should correlate with packet sizes:

```go
type CorrelatedMorphEngine struct {
    sizeEngine  *SizeEngine
    timingEngine *TimingEngine
}

func (e *CorrelatedMorphEngine) Morph(b *buf.Buffer) {
    // Get target size
    targetSize := e.sizeEngine.SelectSize()

    // Select timing based on size category
    var timingProfile *TimingProfile
    if targetSize < 500 {
        timingProfile = e.timingEngine.profiles["small_packet_timing"]
    } else if targetSize < 1000 {
        timingProfile = e.timingEngine.profiles["medium_packet_timing"]
    } else {
        timingProfile = e.timingEngine.profiles["large_packet_timing"]
    }

    // Apply both transformations
    e.sizeEngine.MorphToSize(b, targetSize)
    e.timingEngine.Delay(timingProfile)
}
```

## Testing Plan

### Unit Tests

1. Distribution accuracy (chi-squared test)
2. Burst pattern correctness
3. Adaptive mode behavior
4. Session state management

### Integration Tests

1. VLESS outbound with timing
2. Combined with size morphing
3. Multiple concurrent sessions

### Performance Tests

1. Latency measurement
2. Throughput impact
3. Memory overhead
4. CPU utilization

### DPI Evasion Tests

1. Statistical analysis of timing distributions
2. Comparison with target protocols
3. Detection rate measurement

## Implementation Phases

### Phase 1: Core Timing (Week 1-2)
- [ ] TimingEngine and data structures
- [ ] Distribution algorithms
- [ ] Basic profile definitions

### Phase 2: Integration (Week 3-4)
- [ ] TimingWriter implementation
- [ ] Configuration support
- [ ] VLESS integration

### Phase 3: Advanced Features (Week 5-6)
- [ ] Burst patterns
- [ ] Adaptive mode
- [ ] Size correlation

### Phase 4: Testing & Polish (Week 7-8)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation

## References

- TSPU Documentation: Chapter 23 (DPI Detection Methods)
- Packet Morphing Design: `PACKET_MORPHING_DESIGN.md`
- Network Timing Analysis: Research on traffic classification

---

**Status**: Design Complete, Awaiting Implementation
**Estimated Effort**: 6-8 weeks
**Priority**: High (complements size morphing for full DPI bypass)
**Dependencies**: Packet Morphing Engine (for coordination)
