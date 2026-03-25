# Архитектура Xray-core

## Обзор проекта

**Xray-core** — это платформа сетевого прокси и лучший форк v2ray-core. Он реализует продвинутые прокси-протоколы включая VLESS, XTLS, REALITY, XUDP и PLUX.

- **Репозиторий**: [XTLS/Xray-core](https://github.com/XTLS/Xray-core)
- **Язык**: Go 1.26
- **Лицензия**: MPL-2.0
- **Масштаб**: Средний (~948 файлов, 844 Go исходников)
- **Звёзды**: 36k+

## Основная структура

```
core/           - Core Instance и управление функциями
main/           - Точка входа CLI (команда xray)
app/            - Функции приложения (DNS, router, policy, stats)
proxy/          - Реализации протоколов (inbound/outbound)
transport/      - Транспортный слой (internet, pipe)
common/         - Общие утилиты (crypto, net, buffer)
infra/          - Инфраструктурный код
testing/        - Тестовые утилиты и mocks
```

## Ключевые пакеты

| Пакет | Назначение |
|-------|------------|
| `core/xray.go` | Главный Instance, регистрация функций, жизненный цикл |
| `main/main.go` | Точка входа CLI, режим совместимости v4 |
| `app/proxyman` | Управление inbound/outbound handlers |
| `app/router` | Движок маршрутизации и matching правил |
| `app/dns` | DNS клиент и resolver |
| `proxy/vless` | Реализация протокола VLESS |
| `proxy/vmess` | Реализация протокола VMess |
| `proxy/wireguard` | Поддержка протокола WireGuard |
| `common/crypto` | Криптографические утилиты |
| `transport/internet` | Реализации сетевого транспорта |

## Сборка

### Стандартная сборка
```bash
# Linux / macOS
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main

# Windows (PowerShell)
$env:CGO_ENABLED=0
go build -o xray.exe -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -v ./main
```

### Воспроизводимая сборка
```bash
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -gcflags="all=-l=4" -ldflags="-X github.com/xtls/xray-core/core.build=REPLACE -s -w -buildid=" -v ./main
```

### Тестирование
```bash
go test ./...
go test -v ./core
```

## Основные зависимости

- `github.com/xtls/reality` - REALITY протокол
- `github.com/refraction-networking/utls` - uTLS fingerprinting
- `github.com/apernet/quic-go` - QUIC транспорт
- `golang.zx2c4.com/wireguard` - WireGuard протокол
- `google.golang.org/protobuf` - Protocol buffers
- `github.com/miekg/dns` - DNS библиотека

## Поддерживаемые протоколы

### Входящие протоколы
- VLESS (с XTLS-Vision, REALITY)
- VMess
- Trojan
- Shadowsocks / Shadowsocks 2022
- WireGuard
- HTTP/HTTPS
- SOCKS
- Dokodemo-door
- TUN (full stack)

### Исходящие протоколы
- Freedom (прямой)
- VLESS / VMess / Trojan
- Shadowsocks
- WireGuard
- Blackhole
- Loopback
- DNS

## Конфигурация

Xray-core использует JSON/JSON5/YAML/TOML файлы конфигурации. Основной формат конфигурации определён в:
- `core/config.proto` - Определение protocol buffer
- `core/config.pb.go` - Сгенерированный Go код

## Особенности архитектуры

### Система функций

Xray использует архитектуру на основе функций, где компоненты регистрируются как функции:

```go
type Instance struct {
    features []features.Feature
    // ...
}
```

### Контекст

Широкое использование `context.Context` для:
- Данных запроса
- Метаданных inbound/outbound
- Распространения отмены

### Управление буферами

- `common/buf` - Операции с буферами без копирования
- `common/bytespool` - Пулинг памяти
