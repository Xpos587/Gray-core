# Contributing to Xray-core Fork

## Getting Involved

This fork focuses on research and development in TSPU bypass (DPI circumvention). We welcome contributions in the following areas:

### Priority Areas

1. **DPI Bypass** — Methods to bypass deep packet inspection systems
2. **Traffic Morphing** — Packet size and timing randomization
3. **Protocol Research** — Protocol analysis for vulnerabilities
4. **Testing & Validation** — Testing against real DPI systems

## Development Process

### Before Writing Code

1. Open an [issue](https://github.com/Xpos587/Xray-core/issues) to discuss
2. Describe the problem or proposal
3. Wait for discussion before starting work

### Branching

- Main branch: `main`
- New features developed in separate branches
- After testing and review — merge to `main`

### Code Requirements

1. **Go code**:
   - Follow [Effective Go](https://golang.org/doc/effective_go.html)
   - Before push: `go generate core/format.go`
   - Protobuf changes: `go generate core/proto.go`
   - Before PR: `go test ./...`
   - Code coverage > 70%

2. **Documentation**:
   - Update relevant `.md` files
   - Add comments to complex code
   - Document new features

### Pull Request

1. One PR — one task
2. Clear description of problem/solution
3. Pass tests
4. Wait for review

## Code Style

### Go

```go
// Good
func ProcessPacket(buf []byte) ([]byte, error) {
    if len(buf) == 0 {
        return nil, errors.New("empty buffer")
    }
    // ...
}

// Bad
func processPacket(b []byte) ([]byte,error){
    if len(b)==0{return nil,errors.New("empty")}
    // ...
}
```

### Conventions

- Package paths: `github.com/xtls/xray-core/...`
- Exported functions: Capitalized
- Function comments: Full sentences

## Testing

### Unit Tests

```go
func TestMorphEngine(t *testing.T) {
    engine := NewMorphEngine()
    size := engine.SelectSize()
    assert.Greater(t, size, 0)
}
```

### Integration Tests

```bash
go test -v ./integration/...
```

## Localization

The fork supports multilingual documentation:

- `docs/ru/` — Russian documentation
- `docs/en/` — English documentation

When adding documentation, update both language versions.

## Commit Policy

- Use meaningful commit messages
- Format: `[scope] description`
- Examples:
  - `[morph] add packet size randomization`
  - `[docs] update TSPU research`
  - `[test] add integration tests`

## License

Code is distributed under MPL-2.0, same as the upstream project.
