# CLAUDE.md - Gray-core

## ⚠️ Educational Purpose Notice

**Gray-core is an educational and research project.**

This project is designed for:
- Academic study of network protocols and architecture
- Research into network traffic analysis and patterns
- Understanding of DPI (Deep Packet Inspection) systems
- Documentation of censorship infrastructure for research purposes

**Legal Notice:**
- This software is provided for educational and research purposes only
- Users must comply with all applicable laws and regulations
- The authors do not endorse any illegal use of this software
- No security or anonymity guarantees are provided

## Project Overview

**Gray-core** is a network proxy platform for educational research, studying network protocols, traffic patterns, and DPI systems.

- **Repository**: [Xpos587/Gray-core](https://github.com/Xpos587/Gray-core)
- **Language**: Go 1.26
- **License**: MPL-2.0
- **Scale**: Medium (~900+ files)
- **Purpose**: Educational research and network analysis

## Architecture

### Core Structure

```
core/           - Core Instance and feature management
main/           - CLI entry point (gray-core command)
app/            - Application features (DNS, router, policy, stats)
proxy/          - Protocol implementations (inbound/outbound)
transport/      - Transport layer (internet, pipe)
common/         - Shared utilities (crypto, net, buffer)
infra/          - Infrastructure code
testing/        - Test utilities and mocks
```

### Key Packages

| Package | Purpose |
|---------|---------|
| `core/xray.go` | Main Instance, feature registration, lifecycle |
| `main/main.go` | CLI entry point |
| `app/proxyman` | Inbound/outbound handler management |
| `app/router` | Routing engine and rule matching |
| `app/dns` | DNS client and resolver |
| `proxy/vless` | VLESS protocol implementation |
| `proxy/vmess` | VMess protocol implementation |
| `proxy/wireguard` | WireGuard protocol support |
| `common/crypto` | Cryptographic utilities |
| `transport/internet` | Network transport implementations |

## Build Commands

### Standard Build
```bash
# Linux / macOS
CGO_ENABLED=0 go build -o gray -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main

# Windows (PowerShell)
$env:CGO_ENABLED=0
go build -o gray.exe -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main
```

### Reproducible Build
```bash
CGO_ENABLED=0 go build -o gray-core -trimpath -buildvcs=false -gcflags="all=-l=4" -ldflags="-s -w -buildid=" -v ./main
```

### Testing
```bash
go test ./...
go test -v ./core
```

## Key Dependencies

- `github.com/xtls/reality` - REALITY protocol
- `github.com/refraction-networking/utls` - uTLS fingerprinting
- `github.com/apernet/quic-go` - QUIC transport
- `golang.zx2c4.com/wireguard` - WireGuard protocol
- `google.golang.org/protobuf` - Protocol buffers
- `github.com/miekg/dns` - DNS library

## Protocol Support

### Inbound Protocols
- VLESS
- VMess
- Trojan
- Shadowsocks / Shadowsocks 2022
- WireGuard
- HTTP/HTTPS
- SOCKS
- Dokodemo-door
- TUN (full stack)

### Outbound Protocols
- Freedom (direct)
- VLESS / VMess / Trojan
- Shadowsocks
- WireGuard
- Blackhole
- Loopback
- DNS

## Configuration

Gray-core supports JSON/JSON5/YAML/TOML configuration files.

The main config format is defined in:
- `core/config.proto` - Protocol buffer definition
- `core/config.pb.go` - Generated Go code

### Config Loading
- `main/confloader` - Config file loaders
- `main/json` - JSON parser with comments

## Development Notes

### Feature System
Gray-core uses a feature-based architecture where components register as features:
```go
type Instance struct {
    features []features.Feature
    // ...
}
```

### Context Pattern
Extensive use of `context.Context` for:
- Request-scoped data
- Inbound/outbound metadata
- Cancellation propagation

### Buffer Management
- `common/buf` - Zero-copy buffer operations
- `common/bytespool` - Memory pooling

## Key Concepts

### XTLS Vision
Splice-based transport optimization for TLS connections.

### REALITY
TLS handshake camouflage protocol that mimics real websites.

### XUDP
UDP multiplexing over TCP-based transports.

## Environment

### Go Version
- Requires Go 1.26+
- Uses latest Go stdlib features

### Cross-Compilation
Supports Linux, Windows, macOS, BSD, Android, iOS, and various architectures (amd64, arm64, mips, etc.)

## Testing Strategy

- Unit tests alongside source (`*_test.go`)
- Integration tests in `testing/`
- Use `github.com/golang/mock` for mocks

## Release Process

1. Update version in `app/version/`
2. Set build commit in ldflags
3. Create reproducible builds across platforms
4. Publish to GitHub Releases

## Memory & Performance

- Buffer pooling to reduce GC pressure
- Zero-copy operations where possible
- Connection pooling for DNS
- Efficient routing with cached lookups

## Critical Thinking Checklist

**Before any implementation, ask yourself:**

### Core Question
> **"Не хуйню ли я делаю?"** (Am I doing bullshit?)

### Project Evaluation Criteria
| Criterion | Question | Example |
|-----------|----------|---------|
| `problem_scope` | Is the scope appropriately scoped? | "Add DPI bypass" → Too broad. "Analyze DPI behavior" → Research |
| `motivation` | Is there a compelling justification? | Must be for educational purposes |
| `scalability` | Is the proposed method applicable to research? | Fixed patterns → No. Dynamic analysis → Yes |
| `memorable_takeaway` | Is there a clear research outcome? | What will be learned? |
| `interdisciplinary_appeal` | Does the work have academic value? | Can this apply to other research? |
| `opens_new_directions` | Does the work open new research avenues? | Are we solving root problems? |

### Anti-Patterns
❌ Accepting requirements without questioning "why?"
❌ Assuming "popular" = "safe to mimic"
❌ Fixed patterns in research — become targets
❌ Surface-level understanding of the threat model

### Before Coding
1. **Verify premises**: What facts is this decision based on?
2. **Check research capabilities**: What can we actually analyze?
3. **Consider second-order effects**: If this works, what breaks next?
4. **Search for existing research**: Has this been studied?

## Russia DPI/TSPU Research Context

⚠️ **IMPORTANT**: All TSPU/DPI research in this repository is for **educational purposes only**.

### Research Documentation
Located in `docs/ru/tspu/`:
- Technical analysis of ТСПУ (Technical Means of Threat Combating)
- DPI detection methods documentation
- Network traffic pattern analysis
- Academic study of censorship infrastructure

### Legal Notice
All research materials are provided for:
- Academic study of network infrastructure
- Understanding of censorship systems
- Documentation of technical capabilities
- Research into network protocols

**Not intended for:**
- Circumvention of lawful network restrictions
- Any illegal activities
- Bypass of legitimate security measures

## Documentation

- **Project Docs**: [gray-core.github.io](https://xpos587.github.io/Gray-core/)
- **TSPU Research**: `docs/ru/tspu/`
- **Developer Guides**: `docs/ru/dev/`, `docs/en/dev/`

## License

Mozilla Public License Version 2.0 ([MPL-2.0](LICENSE))

---

**Gray-core** — Educational network proxy platform
Research repository maintained by [@Xpos587](https://github.com/Xpos587)

**Last Updated**: 2026
