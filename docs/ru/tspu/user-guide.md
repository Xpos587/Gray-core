# DPI Bypass User Guide

**Xray-core** includes advanced DPI (Deep Packet Inspection) bypass capabilities that are effective against modern censorship systems including ТСПУ (Russia), GFW (China), and similar infrastructure.

## Quick Start: Maximum DPI Bypass Configuration

```json
{
  "outbounds": [{
    "protocol": "vless",
    "tag": "proxy",
    "settings": {
      "vnext": [{
        "address": "your-server.com",
        "port": 443,
        "users": [{
          "id": "uuid-here",
          "encryption": "none"
        }]
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "reality",
      "realitySettings": {
        "dest": "www.microsoft.com:443",
        "serverNames": ["www.microsoft.com"],
        "publicKey": "public-key-here",
        "shortId": "short-id-here",
        "fingerprint": "chrome"
      }
    }
  }]
}
```

This configuration provides **maximum DPI bypass** using:
- **REALITY protocol** - Mimics real website TLS fingerprint
- **VLESS** - Lightweight protocol with no recognizable headers
- **Chrome fingerprint** - Matches most common browser

---

## DPI Bypass Techniques Explained

### 1. REALITY Protocol

**What it does**: Makes your TLS connection **indistinguishable from a legitimate connection** to a real website (like microsoft.com, apple.com, etc.).

**How it works**:
- Copies TLS fingerprint of target website
- Uses target website's certificate chain
- Establishes connection that looks identical to real traffic

**Why it's effective**:
```
DPI sees: Client Hello → Exactly matches Chrome → www.microsoft.com
DPI thinks: Legitimate connection to Microsoft
Reality: Encrypted proxy traffic underneath
```

**Configuration**:
```json
"streamSettings": {
  "security": "reality",
  "realitySettings": {
    "dest": "www.microsoft.com:443",        // Target to mimic
    "serverNames": ["www.microsoft.com"],    // SNI to send
    "publicKey": "your-server-pubkey",       // From server config
    "shortId": "your-short-id",              // From server config
    "fingerprint": "chrome"                  // Browser to mimic
  }
}
```

**Available Fingerprints**:
- `chrome` - Chrome browser (recommended, most common)
- `firefox` - Firefox browser
- `chrome_120`, `chrome_131` - Specific Chrome versions
- `firefox_105`, `firefox_120` - Specific Firefox versions
- `chrome_115_pq` - Post-quantum variant (experimental)

**Server Selection Tips**:
| Target | Pros | Cons |
|--------|------|------|
| `www.microsoft.com` | Very common, high traffic | Microsoft may block abuse |
| `www.apple.com` | Common, stable | Apple IP ranges may be filtered |
| `www.cloudflare.com` | CDN, many IPs | Cloudflare-aware DPI may exist |
| `www.google.com` | Most common | Google services often targeted |

**⚠️ Important**: The target server must:
1. Support TLS 1.3
2. Have a valid certificate
3. Be accessible from your location
4. Support the chosen fingerprint's cipher suites

---

### 2. ECH (Encrypted Client Hello)

**What it does**: Encrypts the SNI (Server Name Indication) field, making it **impossible for DPI to see which domain** you're connecting to.

**How it works**:
```
Normal TLS: Client Hello (SNI: proxy.com visible to DPI)
ECH:        Client Hello (SNI: encrypted, DPI cannot read)
```

**Why it's effective**:
- TSPU and similar systems **rely on SNI** for HTTPS blocking
- ECH completely hides the domain name
- Compatible with REALITY for layered protection

**Configuration**:
```json
"streamSettings": {
  "security": "tls",
  "tlsSettings": {
    "serverName": "your-server.com",
    "ech": {
      "config": "base64-encoded-ech-config",
      "config": "https://1.1.1.1/dns-query"  // OR DNS-DoH server
    }
  }
}
```

**ECH Config Sources**:
1. **Direct base64** (from server provider)
2. **DNS query** - Automatic via DoH server
   ```
   Format: "domain+https://dns-server/dns-query"
   Example: "cloudflare.com+https://1.1.1.1/dns-query"
   ```

**Force Query Modes**:
- `full` (default) - Fail if ECH config not found
- `half` - Continue without ECH if query fails
- `none` - Don't query, use cached only

**ECH + REALITY Combination**:
```json
"streamSettings": {
  "security": "reality",
  "realitySettings": {
    "dest": "www.microsoft.com:443",
    "serverNames": ["www.microsoft.com"],
    "publicKey": "...",
    "shortId": "...",
    "fingerprint": "chrome"
  },
  "ech": {
    "config": "https://1.1.1.1/dns-query",
    "forceQuery": "full"
  }
}
```

---

### 3. TLS Fingerprints

**What it does**: Makes your TLS handshake match specific browsers, preventing fingerprint-based detection.

**Available Fingerprints**:

**Chrome** (recommended for most users):
```
chrome, chrome_120, chrome_131 (latest)
chrome_100, chrome_102, chrome_106
chrome_106_shuffle, chrome_115_pq
```

**Firefox**:
```
firefox, firefox_120
firefox_105, firefox_102
```

**When to use each**:
| Fingerprint | Best For | Notes |
|-------------|----------|-------|
| `chrome` | General use | Most common, blends in |
| `firefox` | Alternative | Good backup |
| `chrome_131` | Latest browser | May be less tested |
| `chrome_115_pq` | Post-quantum | Experimental |

---

### 4. Transport Protocols

**VLESS** (recommended):
- Lightweight, minimal headers
- No recognizable protocol signature
- Best for new deployments

**VMess** (legacy):
- More traffic overhead
- Older protocol, may be fingerprinted
- Use only if required for compatibility

**Trojan**:
- Mimics real HTTPS traffic
- Good for environments with protocol whitelisting

---

## Configuration Templates

### Template 1: Maximum DPI Bypass (REALITY)

**Best for**: Russia (ТСПУ), China (GFW), Iran

```json
{
  "outbounds": [{
    "protocol": "vless",
    "tag": "reality-proxy",
    "settings": {
      "vnext": [{
        "address": "your-server-ip",
        "port": 443,
        "users": [{
          "id": "your-uuid",
          "flow": "xtls-rprx-vision",
          "encryption": "none"
        }]
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "reality",
      "realitySettings": {
        "dest": "www.microsoft.com:443",
        "serverNames": ["www.microsoft.com"],
        "publicKey": "your-public-key",
        "shortId": "0",
        "fingerprint": "chrome",
        "spiderX": "/"
      }
    }
  }]
}
```

### Template 2: ECH-Only Configuration

**Best for**: When REALITY server not available

```json
{
  "outbounds": [{
    "protocol": "vless",
    "tag": "ech-proxy",
    "settings": {
      "vnext": [{
        "address": "your-server.com",
        "port": 443,
        "users": [{
          "id": "your-uuid",
          "encryption": "none"
        }]
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls",
      "tlsSettings": {
        "serverName": "your-server.com",
        "fingerprint": "chrome",
        "ech": {
          "config": "https://1.1.1.1/dns-query",
          "forceQuery": "full"
        }
      }
    }
  }]
}
```

### Template 3: Trojan with ECH

**Best for**: Protocol whitelist environments

```json
{
  "outbounds": [{
    "protocol": "trojan",
    "tag": "trojan-proxy",
    "settings": {
      "servers": [{
        "address": "your-server.com",
        "port": 443,
        "password": "your-password"
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls",
      "tlsSettings": {
        "serverName": "your-server.com",
        "fingerprint": "chrome",
        "ech": {
          "config": "base64-ech-config-or-dns-url",
          "forceQuery": "half"
        }
      }
    }
  }]
}
```

---

## Advanced Configuration

### Multi-Server Failover

```json
{
  "outbounds": [
    {
      "tag": "reality-primary",
      "protocol": "vless",
      "streamSettings": {
        "security": "reality",
        "realitySettings": {
          "dest": "www.microsoft.com:443",
          "serverNames": ["www.microsoft.com"],
          "fingerprint": "chrome"
        }
      }
    },
    {
      "tag": "reality-backup",
      "protocol": "vless",
      "streamSettings": {
        "security": "reality",
        "realitySettings": {
          "dest": "www.apple.com:443",
          "serverNames": ["www.apple.com"],
          "fingerprint": "firefox"
        }
      }
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [{
      "type": "field",
      "outboundTag": "reality-backup",
      "domain": ["geosite:category-ads-all"]
    }]
  }
}
```

### Fingerprint Rotation

Some advanced setups rotate fingerprints periodically. This can be achieved with external scripting or by maintaining multiple server configurations.

---

## Troubleshooting

### Issue: "REALITY: processed invalid connection"

**Cause**: Server returned real certificate (not expected)

**Solutions**:
1. Check if target server is accessible
2. Verify `serverNames` matches target domain
3. Try different target server
4. Check if `publicKey` is correct

### Issue: ECH connection failures

**Cause**: ECH config not available or incompatible

**Solutions**:
1. Change `forceQuery` to `"half"` or `"none"`
2. Try different DNS server (Cloudflare, Google, Quad9)
3. Verify server supports ECH
4. Check for DNS interference

### Issue: Connection drops after a few minutes

**Cause**: Session timeout or DPI learning

**Solutions**:
1. Enable multiplexing (`muxSettings`)
2. Change fingerprint
3. Switch to different target server
4. Check server logs for errors

### Issue: Slow connection speeds

**Cause**: Suboptimal transport settings

**Solutions**:
1. Enable XTLS-Vision (`flow: "xtls-rprx-vision"`)
2. Use TCP instead of WebSocket if not required
3. Check if QUIC is available in your region
4. Verify server bandwidth

---

## System-Specific Guidance

### Russia (ТСПУ)

**Recommended Configuration**: REALITY + Chrome fingerprint

**Targets to Avoid**:
- `telegram.org` - Actively blocked
- `.ru` domains - May be inspected more closely
- Known proxy providers

**Recommended Targets**:
- `www.microsoft.com`
- `www.apple.com`
- `www.cloudflare.com`

### China (GFW)

**Recommended Configuration**: REALITY + VLESS

**Additional Measures**:
- Use CDN-fronted servers if possible
- Enable `xtls-rprx-vision` flow
- Consider Shadowsocks 2022 fallback

### Iran

**Recommended Configuration**: REALITY or Trojan

**Known Issues**:
- Deep SSL inspection in some cases
- Consider ECH for SNI hiding

---

## Security Best Practices

1. **Never share private keys** - Your REALITY private key is secret
2. **Use UUIDs** - Never use predictable user IDs
3. **Regular updates** - Keep Xray-core updated for latest bypasses
4. **Monitoring** - Check server logs for DPI detection attempts
5. **Redundancy** - Maintain backup servers and configurations

---

## Performance Optimization

### Enable XTLS-Vision

```json
"users": [{
  "id": "uuid",
  "flow": "xtls-rprx-vision"  // Splice optimization
}]
```

**Benefits**:
- Reduced CPU usage
- Lower latency
- Better throughput

**Requirements**:
- Both client and server support XTLS
- TCP transport
- REALITY or TLS security

### Disable Unused Features

```json
"streamSettings": {
  "sockopt": {
    "tcpKeepAliveInterval": 30,
    "tcpKeepAliveIdle": 60
  }
}
```

---

## References

- **TSPU Documentation**: `docs/tspu/` - Internal analysis of Russian censorship system
- **Research Notes**: `docs/tspu/RESEARCH.md` - Technical research on DPI bypass
- **Upstream Documentation**: https://xtls.github.io

---

**Last Updated**: 2025-03-25
**Xray-core Version**: 1.8.x+
**Status**: Production Ready
