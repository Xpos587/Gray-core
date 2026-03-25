# Контрибьюция в Xray-core Fork

## Участие в разработке

Этот форк фокусируется на исследованиях и разработках в области обхода ТСПУ (DPI bypass). Мы приветствуем вклад в следующие области:

### Приоритетные направления

1. **DPI Bypass** — Методы обхода систем глубокого анализа пакетов
2. **Traffic Morphing** — Рандомизация размеров пакетов и таймингов
3. **Protocol Research** — Исследования протоколов для поиска уязвимостей
4. **Testing & Validation** — Тестирование против реальных DPI систем

## Процесс разработки

### Перед написанием кода

1. Откройте [issue](https://github.com/Xpos587/Xray-core/issues) для обсуждения
2. Опишите проблему или предложение
3. Дождитесь обсуждения перед началом работы

### Ветвление (Branching)

- Главная ветка: `main`
- Новые функции разрабатываются в отдельных ветках
- После тестирования и ревью — merge в `main`

### Требования к коду

1. **Go код**:
   - Следуйте [Effective Go](https://golang.org/doc/effective_go.html)
   - Перед push: `go generate core/format.go`
   - Протобуф изменения: `go generate core/proto.go`
   - Перед PR: `go test ./...`
   - Охват кода > 70%

2. **Документация**:
   - Обновляйте соответствующие `.md` файлы
   - Добавляйте комментарии к сложному коду
   - Документируйте новые функции

### Pull Request

1. Один PR — одна задача
2. Понятное описание проблемы/решения
3. Пройдите тесты
4. Дождитесь ревью

## Стиль кода

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

### Конвенции

- Пакетные пути: `github.com/xtls/xray-core/...`
- Экспортируемые функции: Capitalized
- Комментарии к функциям: Полные предложения

## Тестирование

### Unit тесты

```go
func TestMorphEngine(t *testing.T) {
    engine := NewMorphEngine()
    size := engine.SelectSize()
    assert.Greater(t, size, 0)
}
```

### Интеграционные тесты

```bash
go test -v ./integration/...
```

## Локализация

Форк поддерживает мультиязычную документацию:

- `docs/ru/` — Русская документация
- `docs/en/` — English documentation

При добавлении документации обновляйте обе языковые версии.

## Политика коммитов

- Используйте осмысленные сообщения коммитов
- Формат: `[scope] description`
- Примеры:
  - `[morph] add packet size randomization`
  - `[docs] update TSPU research`
  - `[test] add integration tests`

## Лицензия

Код распространяется под MPL-2.0, как и upstream проект.
