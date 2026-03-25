# DPI Bypass Research

Educational research on DPI (Deep Packet Inspection) systems and bypass techniques.

## Overview

This document summarizes research into ТСПУ (Technical Means of Threat Combating) systems and identifies weaknesses that can be addressed for educational purposes.

**⚠️ Legal Notice**: This research is provided for educational and academic purposes only. Users must comply with all applicable laws.

## DPI Detection Methods

### What DPI Systems Analyze

| Detection Vector | Description | Encrypted Traffic |
|------------------|-------------|-------------------|
| **Packet Sizes** | Average, variance, patterns, min/max | Still visible - major weakness |
| **Timing Patterns** | Intervals, regularity, bursts | Still visible - major weakness |
| **Content Signatures** | Keywords, byte sequences | Hidden by encryption |
| **Session Behavior** | Bidirectional packet analysis | Degraded but partially effective |

### Key Finding

For **encrypted traffic**, DPI relies **exclusively** on indirect statistical analysis:

- Packet size distributions
- Inter-packet timing
- Session establishment patterns

> *"Для распознавания зашифрованных протоколов (например, Telegram) используется многофакторный анализ — математическая модель, которая на основе совокупности косвенных признаков делает вывод о принадлежности данной сессии к конкретному протоколу."* — ТСПУ, §23.1.4

## System Architecture

### Two-Stage Blocking Process

```mermaid
graph LR
    A[Stage 1: Recognition] --> B[Logging Only<br/>No Blocking]
    B --> C[Central System<br/>5-15 min aggregation]
    C --> D[Stage 2: Verified Blocking]
```

**Observation**: New connections have a 5-15 minute window before blocking after initial detection.

### Session Processing

```mermaid
graph LR
    A[Source IP + Dest IP + Protocol] --> B[Hash Function]
    B --> C[Same Processing Core]
    C --> D[Consistent Analysis]
```

The system uses hash-based session pinning - the same session always goes to the same filter/core.

### HTTPS Inspection

| Protocol | What's Visible |
|----------|---------------|
| HTTP | Full URL |
| HTTPS | Only domain name (SNI) |

**Note**: TLS 1.3 Encrypted Client Hello (ECH) can block SNI inspection entirely.

## Bypass Techniques

### Statistical Pattern Obfuscation

Since encrypted traffic analysis relies on statistical patterns, obfuscating these patterns can reduce detection:

**1. Packet Size Randomization**
- Variable packet sizes instead of uniform sizes
- Match natural traffic profiles (streaming, browsing)
- See: [Packet Morphing](/ru/tspu/packet-morphing)

**2. Timing Pattern Randomization**
- Add jitter to inter-packet intervals
- Burst patterns instead of regular timing
- See: [Timing Randomization](/ru/tspu/timing-randomization)

### Protocol Mimicry

Making proxy traffic statistically resemble innocent protocols:

| Target | Characteristics |
|--------|----------------|
| YouTube streaming | Variable sizes (200-1400 bytes), regular timing |
| HTTPS browsing | Standard TLS + mixed packet sizes |
| Video calls | Regular small packets for audio/video |

### Transport Layer Obfuscation

**WebSocket**
- Wraps traffic in WebSocket protocol
- Looks like standard web traffic
- HTTP/HTTPS handshake appearance

**gRPC**
- HTTP/2 based protocol
- Binary protocol framing
- Less common protocol signature

**QUIC/HTTP3**
- UDP-based transport
- Different traffic patterns than TCP
- Requires UDP support

## Implementation

### Gray-core Configuration

Gray-core implements packet morphing and timing randomization:

```json
{
  "outbound": {
    "protocol": "vless",
    "streamSettings": {
      "network": "tcp",
      "security": "tls",
      "morph": {
        "enabled": true,
        "profile": "dynamic"
      },
      "timing": {
        "enabled": true,
        "profile": "dynamic"
      }
    }
  }
}
```

### Dynamic Profile

The **dynamic** profile uses:
- Normal distribution for packet sizes
- Gaussian jitter for timing
- Automatic adaptation to traffic type

This provides the best balance of effectiveness and performance.

## Research Sources

This research is based on analysis of:

- TSPU Technical Documentation ([Главы 01-24](/ru/tspu/))
- Open-source DPI systems (nDPI, Suricata)
- Academic papers on traffic analysis

## Further Reading

- [Packet Morphing](/ru/tspu/packet-morphing) - Implementation details
- [Timing Randomization](/ru/tspu/timing-randomization) - Timing obfuscation
- [User Guide](/ru/tspu/user-guide) - Practical configuration
- [TSPU Overview](/ru/tspu/) - Complete TSPU documentation

## References

- TSPU Documentation: §23 (Detection Methods)
- Packet Morphing Design: [packet-morphing.md](/ru/tspu/packet-morphing)
- Timing Randomization: [timing-randomization.md](/ru/tspu/timing-randomization)

---

**⚠️ Educational Purpose Only**

This research is provided for:
- Academic study of network systems
- Understanding of censorship infrastructure
- Documentation of technical capabilities

Users must comply with all applicable laws and regulations.
