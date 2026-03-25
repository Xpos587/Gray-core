# Gray-core

<div align="center">

**A network proxy platform for educational research.**

[![Stars](https://img.shields.io/github/stars/Xpos587/Gray-core?style=flat)](https://github.com/Xpos587/Gray-core)
[![License](https://img.shields.io/badge/license-MPL--2.0-purple)](https://github.com/Xpos587/Gray-core/blob/main/LICENSE)
[![Docs](https://img.shields.io/badge/docs-gray--core-blue)](https://xpos587.github.io/Gray-core/)

</div>

## ⚠️ Educational Disclaimer

**This project is intended solely for educational and research purposes.**

Gray-core is a network proxy platform developed to study:
- Network protocol analysis and behavior
- DPI (Deep Packet Inspection) systems and their characteristics
- Network traffic patterns and statistics
- Protocol obfuscation concepts for academic research

**Important Legal Notice:**
- This software is provided for research and educational purposes only
- Users are responsible for complying with all applicable laws and regulations
- The authors do not condone or encourage any illegal use
- This project does not provide anonymity guarantees or security assurances

By using this software, you agree that you understand and accept these terms.

## About Gray-core

Gray-core is a network proxy platform based on open-source technologies, modified and extended for educational research into network protocols, traffic analysis, and censorship systems.

### Research Areas

- **Protocol Analysis** — Study of network protocol behavior and characteristics
- **Traffic Patterns** — Analysis of network traffic statistics and patterns
- **DPI Research** — Documentation and analysis of inspection systems
- **Network Architecture** — Understanding of modern network infrastructure

### Documentation

See [gray-core.github.io](https://xpos587.github.io/Gray-core/) for:
- Technical documentation on network systems
- Research papers and analysis
- Architecture documentation
- Developer guides

## Quick Start

### Build

```bash
# Linux / macOS
CGO_ENABLED=0 go build -o gray -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main

# Windows (PowerShell)
$env:CGO_ENABLED=0
go build -o gray.exe -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main
```

### Test

```bash
go test ./...
```

## Architecture

```
core/           # Core instance and feature management
main/           # CLI entry point
app/            # DNS, router, policy, stats features
proxy/          # Protocol implementations (inbound/outbound)
transport/      # Network transport layer
common/         # Shared utilities (crypto, net, buffer)
```

See [`CLAUDE.md`](CLAUDE.md) for detailed project documentation.

## Supported Protocols

- **VLESS** — Lightweight protocol
- **VMess** — Original protocol
- **Trojan** — Trojan protocol
- **Shadowsocks** — Shadowsocks protocol
- **WireGuard** — WireGuard protocol
- **HTTP/HTTPS**, **SOCKS** — Standard proxy protocols

## Configuration

Gray-core supports JSON/JSON5/YAML/TOML configuration files.

Example:
```json
{
  "inbounds": [{
    "port": 1080,
    "protocol": "socks",
    "settings": {"udp": true}
  }],
  "outbounds": [{
    "protocol": "freedom"
  }]
}
```

## Project Links

- **Documentation**: [Gray-core Docs](https://xpos587.github.io/Gray-core/)
- **Repository**: [github.com/Xpos587/Gray-core](https://github.com/Xpos587/Gray-core)

## License

Mozilla Public License Version 2.0 ([MPL-2.0](https://github.com/Xpos587/Gray-core/blob/main/LICENSE))

---

**Gray-core** — Educational network proxy platform
Maintained by [@Xpos587](https://github.com/Xpos587)

**Last Updated**: 2026
