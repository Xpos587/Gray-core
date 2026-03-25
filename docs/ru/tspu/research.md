# DPI Bypass Research - Xray-core Fork

**Status**: Research and Analysis Phase
**Purpose**: Identify DPI system weaknesses and develop enhanced protocol obfuscation techniques for censorship circumvention.

## Executive Summary

Based on comprehensive analysis of ТСПУ (Technical Means of Threat Combating) documentation, several key vulnerabilities and bypass opportunities have been identified. The Russian censorship system uses multi-factor DPI analysis with specific weaknesses that can be exploited.

## DPI Detection Methods

### What TСПУ Analyzes

| Detection Vector | Description | Encrypted Traffic Impact |
|------------------|-------------|-------------------------|
| **Packet Sizes** | Average, variance, patterns, min/max | Still visible - major weakness |
| **Timing Patterns** | Intervals, regularity, bursts | Still visible - major weakness |
| **Content Signatures** | Keywords, byte sequences | **Hidden** by encryption |
| **Session Behavior** | Bidirectional packet analysis | Degraded but partially effective |

### Critical Finding

For **encrypted traffic**, DPI relies **exclusively** on indirect statistical analysis:
- Packet size distributions
- Inter-packet timing
- Session establishment patterns

> *"For recognition of encrypted protocols (e.g., Telegram), multi-factor analysis is used — a mathematical model that, based on a combination of indirect signs, concludes that a given session belongs to a specific protocol."* — TSPU Docs, §23.1.4

## System Architecture Weaknesses

### 1. Two-Stage Blocking (5-15 Minute Window)

```
Stage 1: Recognition → Logging (no blocking)
          ↓
    Central System Aggregation (~5-15 min)
          ↓
Stage 2: Verified Blocking (IP lists loaded)
```

**Exploit**: New servers have 5-15 minutes before blocking after first detection.

### 2. Hash-Based Session Pinning

```
Hash = source IP + destination IP + protocol
→ Same session ALWAYS goes to same filter/core
```

**Exploit**: Predictable processing location enables targeted evasion.

### 3. HTTPS: SNI-Only Inspection

| Protocol | Inspection Depth |
|----------|-----------------|
| HTTP | Full URL visible |
| HTTPS | **Only domain name (SNI)** |

**Exploit**: TLS 1.3 Encrypted Client Hello (ECH) completely blocks SNI inspection.

### 4. Send RST Off (Default Behavior)

System silently drops packets instead of sending TCP Reset:
- Reduces client retry storms
- Makes detection of blocking less obvious
- **Beneficial for bypass**: No immediate connection error indication

## Identified Bypass Techniques

### Tier 1: Protocol Mimicry

**Concept**: Make proxy traffic statistically indistinguishable from innocent protocols.

| Target Protocol | Characteristics |
|-----------------|-----------------|
| YouTube streaming | Variable packet sizes (200-1400 bytes), regular timing |
| HTTPS browsing | Standard TLS handshake + mixed packet sizes |
| QUIC (HTTP/3) | UDP-based, specific congestion patterns |

**Implementation Requirements**:
- Packet size randomization matching target distributions
- Timing pattern replication (jitter, bursts)
- TLS fingerprint matching (uTLS library integration)

### Tier 2: TLS 1.3 with Encrypted Client Hello (ECH)

**Current State**: Xray-core already supports TLS 1.3

**Enhancement Needed**:
```go
// Add ECH (Encrypted Client Hello) support
// This encrypts the SNI, making domain inspection impossible
type ECHConfig struct {
    // ECH configuration from target server
}
```

**Effect**: Completely blocks SNI-based blocking for HTTPS.

### Tier 3: QUIC Protocol Enhancement

**Current State**: Xray-core uses `apernet/quic-go`

**Enhancement Opportunities**:
1. Randomized packet size distributions
2. Congestion control pattern variation
3. Custom QUIC transport parameters

### Tier 4: Traffic Morphing

**Dynamic Obfuscation**:
- Per-session packet size distribution profiles
- Adaptive timing based on "learned" innocent traffic
- Multi-protocol mimicry within single session

## Implementation Roadmap

### Phase 1: Research & Analysis (Current)
- [x] Analyze TSPU documentation
- [x] Identify DPI detection methods
- [x] Document system weaknesses
- [ ] Create traffic capture profiles for innocent protocols
- [ ] Benchmark current Xray-core against DPI signatures

### Phase 2: Protocol Mimicry Implementation
- [ ] Packet size distribution engine
- [ ] Timing pattern randomization
- [ ] TLS fingerprint customization (uTLS)
- [ ] QUIC pattern enhancement

### Phase 3: Advanced Evasion
- [ ] TLS 1.3 ECH integration
- [ ] Domain fronting 2.0 (CDN bypass)
- [ ] Multi-stage handshake obfuscation
- [ ] Real-time traffic morphing

### Phase 4: Testing & Validation
- [ ] Lab testing against open-source DPI
- [ ] Field testing (where legal)
- [ ] Continuous signature update mechanism

## Technical Specifications

### Packet Size Distribution

```go
// Proposed: Protocol profile system
type ProtocolProfile struct {
    Name          string
    PacketSizes   []WeightedSize  // Size + probability
    TimingPattern TimingProfile
    TLSSignature  uTLS.ClientHelloSpec
}

type WeightedSize struct {
    Size       int     // Packet size in bytes
    Probability float64 // 0.0-1.0
}

type TimingProfile struct {
    MinInterval    time.Duration
    MaxInterval    time.Duration
    BurstPattern   []BurstConfig
}
```

### Target Profiles

**YouTube Streaming Profile**:
- Packet sizes: 200-1400 bytes (weighted distribution)
- Timing: Regular ~20ms intervals (video frame timing)
- TLS: Chrome fingerprint

**Standard HTTPS Profile**:
- Packet sizes: Mixed 40-1400 bytes (bimodal distribution)
- Timing: Irregular (page load patterns)
- TLS: Firefox/Safari fingerprint rotation

## Existing Xray-core DPI Bypass Capabilities

### ✅ Already Implemented

| Feature | Status | DPI Effectiveness |
|---------|--------|------------------|
| **ECH (Encrypted Client Hello)** | ✅ Full support | **Blocks SNI inspection completely** |
| **REALITY Protocol** | ✅ Full support | Mimics real websites, X25519MLKEM768 |
| **uTLS Fingerprints** | ✅ 20+ fingerprints | Chrome/Firefox versions 58-131 |
| **QUIC** | ✅ Implemented | UDP-based bypass |
| **VLESS** | ✅ Implemented | Lightweight protocol |
| **XTLS-Vision** | ✅ Implemented | Splice-based optimization |
| **Spider/Crawler** | ✅ In REALITY | Generates realistic browsing traffic |

### ECH Implementation Details

`transport/internet/tls/ech.go`:
- DNS HTTPS (Type65) record queries
- Direct base64 ECH config support
- DOH and UDP DNS support
- Config caching with TTL
- Force query modes: none/half/full

**Impact**: Completely blocks TSPU's primary HTTPS inspection method (SNI).

### REALITY Implementation Details

`transport/internet/reality/reality.go`:
- TLS handshake mimicry via uTLS
- X25519MLKEM768 key exchange
- ML-DSA-65 certificate verification
- Spider module for realistic traffic generation
- Multi-path crawling for behavioral mimicry

**Impact**: Makes proxy traffic indistinguishable from legitimate connections to real websites.

### TLS Fingerprint Library

`transport/internet/tls/tls.go`:
```
Chrome:  58, 62, 70, 72, 83, 87, 96, 100, 102, 106, 106_Shuffle, 120, 131
Firefox: 55, 56, 63, 65, 99, 102, 105, 120
Special: PSK variants, PQ (Post-Quantum), Padding variants
```

## Integration Points with Xray-core

### Existing Features to Leverage

| Feature | Current Status | Enhancement Needed |
|---------|---------------|-------------------|
| **ECH** | ✅ Fully implemented | Docs, testing |
| **REALITY** | ✅ Fully implemented | Wider adoption |
| **uTLS** | ✅ 20+ fingerprints | Add latest browser versions |
| **VLESS** | ✅ Implemented | Add packet size profiles |
| **XTLS-Vision** | ✅ Implemented | Already optimal |
| **QUIC** | ✅ Implemented | Add timing randomization |

### Recommended Code Locations

```
proxy/vless/           → Add protocol profile selection
transport/internet/    → Packet size morphing engine
common/utls/           → Fingerprint profile expansion
proxy/reality/         → ECH integration
```

## Threat Model: TSPU Countermeasures

### Expected DPI Updates

| Timeline | Expected Countermeasure | Our Response |
|----------|------------------------|--------------|
| 0-3 months | Signature updates for new patterns | Rapid profile rotation |
| 3-6 months | ML-based traffic classification | Adversarial training |
| 6-12 months | Behavior analysis across sessions | Session randomization |
| 12+ months | Hardware-level DPI acceleration | Continue encryption focus |

### Sustainable Strategy

The documentation confirms:
> *"Quality imitation of another protocol — **impossible to recognize** without fundamentally new approach."* — TSPU Docs, §23.4

This means **perfect mimicry is theoretically achievable** and would require substantial DPI architecture changes to counter.

## References

- **TSPU Documentation**: `docs/tspu/README.md`
- **Chapter 17**: DPI configuration and blocking mechanisms
- **Chapter 23**: DPI engine recognition methods
- **Chapter 7**: Second-tier system (Eco Highway) architecture
- **Xray-core REALITY**: Already implements SNI bypass techniques

## Key Findings Summary

### Critical Discovery: Xray-core Already Has Strong DPI Bypass

The analysis reveals that **Xray-core already implements the most effective DPI bypass techniques** identified in the TSPU documentation:

1. **ECH (Encrypted Client Hello)** - Completely blocks SNI inspection
2. **REALITY Protocol** - Mimics real websites' TLS fingerprints
3. **Comprehensive uTLS Library** - 20+ browser fingerprints

### What TSPU Cannot Inspect

| Traffic Type | TSPU Capability | Xray-core Countermeasure |
|-------------|----------------|------------------------|
| HTTPS SNI | ✅ Can inspect | ECH - **Blocks completely** |
| TLS Content | ❌ Encrypted | End-to-end encryption |
| TLS Fingerprint | ✅ Can match | REALITY - **Matches real sites** |
| Packet Sizes | ✅ Statistical | (Enhancement opportunity) |
| Timing Patterns | ✅ Statistical | (Enhancement opportunity) |

### Priority Enhancement Areas

Based on TSPU documentation analysis, the remaining enhancement opportunities are:

1. **Packet Size Morphing** - Randomize to match target protocol distributions
2. **Timing Pattern Randomization** - Break statistical signatures
3. **Fingerprint Rotation** - Periodically change browser fingerprints
4. **QUIC Pattern Enhancement** - Add timing jitter

### Theoretical Limit

From TSPU documentation §23.4:
> *"Quality imitation of another protocol — **impossible to recognize** without fundamentally new approach."*

This means with perfect protocol mimicry, TSPU would require **complete architecture redesign** to detect.

## Contributing

This is a research fork. Contributions should:
1. Document findings with evidence
2. Test against actual DPI systems where legal
3. Maintain separation between research and production code
4. Follow ethical guidelines for censorship circumvention research

---

**Last Updated**: 2025-03-25
**Research Status**: Phase 1 (Analysis)
