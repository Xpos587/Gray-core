# Xray-core

<div align="center">

**A network proxy platform for building proxies.**

[![Stars](https://img.shields.io/github/stars/Xpos587/Xray-core?style=flat)](https://github.com/Xpos587/Xray-core)
[![Upstream](https://img.shields.io/badge/upstream-XTLS%2FXray--core-blue)](https://github.com/XTLS/Xray-core)
[![License](https://img.shields.io/badge/license-MPL--2.0-purple)](LICENSE)

</div>

## About This Fork

This is a **fork of [XTLS/Xray-core](https://github.com/XTLS/Xray-core)** maintained by [@Xpos587](https://github.com/Xpos587).

### Purpose

- Research and analysis of modern censorship circumvention systems
- Development of enhanced protocol obfuscation techniques
- Study of DPI (Deep Packet Inspection) bypass methods
- Documentation and technical analysis of censorship infrastructure

### Documentation

See `/docs/tspu/` for technical documentation on censorship systems (ТСПУ, DPI, traffic analysis).

---

## What is Xray-core?

Xray-core is a network proxy platform and the best v2ray-core fork. It implements advanced proxy protocols:

- **VLESS** — Lightweight protocol
- **XTLS** — TLS acceleration and camouflage
- **REALITY** — TLS handshake mimicking real websites
- **XUDP** — UDP multiplexing over TCP
- **WireGuard**, **Trojan**, **Shadowsocks**, **VMess** and more

## Quick Start

### Build

```bash
# Linux / macOS
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main

# Windows (PowerShell)
$env:CGO_ENABLED=0
go build -o xray.exe -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main
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

## Configuration

Xray-core supports JSON/JSON5/YAML/TOML configuration files.

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

- **Upstream**: [XTLS/Xray-core](https://github.com/XTLS/Xray-core)
- **Documentation**: [Project X Website](https://xtls.github.io)
- **Examples**: [XTLS/Xray-examples](https://github.com/XTLS/Xray-examples)

## License

Mozilla Public License Version 2.0 ([MPL-2.0](LICENSE))

---

**Upstream**: [XTLS/Xray-core](https://github.com/XTLS/Xray-core) | **Fork**: [@Xpos587](https://github.com/Xpos587)
