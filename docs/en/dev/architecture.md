# Xray-core Architecture

## Overview

**Xray-core** is a network proxy platform and the best v2ray-core fork. It implements advanced proxy protocols including VLESS, XTLS, REALITY, XUDP, and PLUX.

- **Repository**: [XTLS/Xray-core](https://github.com/XTLS/Xray-core)
- **Language**: Go 1.26
- **License**: MPL-2.0
- **Scale**: Medium (~948 files, 844 Go sources)
- **Stars**: 36k+

## Core Structure

```
core/           - Core Instance and feature management
main/           - CLI entry point (xray command)
app/            - Application features (DNS, router, policy, stats)
proxy/          - Protocol implementations (inbound/outbound)
transport/      - Transport layer (internet, pipe)
common/         - Shared utilities (crypto, net, buffer)
infra/          - Infrastructure code
testing/        - Test utilities and mocks
```

## Key Packages

| Package | Purpose |
|---------|---------|
| `core/xray.go` | Main Instance, feature registration, lifecycle |
| `main/main.go` | CLI entry point, v4 compatibility mode |
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
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main

# Windows (PowerShell)
$env:CGO_ENABLED=0
go build -o xray.exe -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main
```

### Reproducible Build
```bash
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -gcflags="all=-l=4" -ldflags="-X github.com/xtls/xray-core/core.build=REPLACE -s -w -buildid=" -v ./main
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
- VLESS (with XTLS-Vision, REALITY)
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

Xray-core uses JSON/JSON5/YAML/TOML configuration files. The main config format is defined in:
- `core/config.proto` - Protocol buffer definition
- `core/config.pb.go` - Generated Go code

## Architecture Features

### Feature System

Xray uses a feature-based architecture where components register as features:

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
