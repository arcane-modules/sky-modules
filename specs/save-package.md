# @sky-modules/save — Persistence (save/load)

## Описание

Пакет `@sky-modules/save` предоставляет механизм сохранения и загрузки реактивных объектов в JSON с сохранением метаданных классов (class, id, version). В отличие от `@sky-modules/share`, save() сериализует **все** поля, включая `@secret` — модификаторы влияют только на сетевую синхронизацию.

## Ключевые принципы

- **save()** — сериализует объект в JSON строку с метаданными класса
- **load()** — десериализует JSON обратно в типизированные объекты с восстановлением классов
- **Поддерживает специальные типы**: Date, Map, Set, RegExp
- **Миграции**: версионная эволюция схемы (опционально, в отдельном пакете)
- **Алиасы**: переименование классов (опционально)
- **ID remapping**: разрешение конфликтов ID при мерже (опционально)

## API

### `save(value, options?)`

Сериализует объект в JSON строку с метаданными класса.

```typescript
import { save } from '@sky-modules/save'

@define('app.User')
class User {
    @string name = 'Anna'
    @number age = 25
    @secret.string password = 'hidden'
}

const user = new User()
const json = save(user)
// {"class":"app.User","id":1,"version":"20241208_125510","data":{"name":"Anna","age":25,"password":"hidden"}}
```

### `load(json, options?)`

Десериализует JSON строку обратно в типизированные объекты.

```typescript
const restored = load<User>(json)
// restored instanceof User → true
// restored.name → "Anna"
// restored.age → 25
```

### `serializeWithMetadata(obj)`

Сериализует объект с метаданными, возвращая объект (не строку).

### `deserializeWithMetadata(obj)`

Десериализует распарсенный объект с восстановлением классов.

## Формат данных

```typescript
interface SerializedData {
    class: string       // Fully qualified class name (e.g., 'app.User')
    id: number          // Unique instance ID
    version: string | null  // Migration version timestamp
    data: Record<string, unknown>  // Actual object data
}
```

### Специальные типы

```typescript
// Date
{ __type: 'Date', value: '2024-01-01T00:00:00.000Z' }

// Map
{ __type: 'Map', entries: [[key, value], ...] }

// Set
{ __type: 'Set', values: [value1, value2, ...] }

// RegExp
{ __type: 'RegExp', source: '\\d+', flags: 'g' }
```

## Зависимости

- `@sky-modules/define` — для `@define()`, `idSymbol`, `uidSymbol`
- `@sky-modules/schema` — для schema introspection (получение списка полей)

## Тесты

- `src/save.test.ts` — ~15 тестов
  - save/load простых объектов
  - save/load с @define классами
  - Специальные типы (Date, Map, Set, RegExp)
  - Вложенные объекты
  - Массивы
  - Ошибки: неизвестный класс, невалидный JSON

## План реализации

1. Создать `packages/save/` с package.json, tsconfig, vitest.config
2. Реализовать `src/serialize.ts` — `serializeWithMetadata()`
3. Реализовать `src/deserialize.ts` — `deserializeWithMetadata()`
4. Реализовать `src/save.ts` — `save()`
5. Реализовать `src/load.ts` — `load()`
6. Реализовать `src/index.ts` — public API
7. Написать тесты
8. Добавить в `packages/core`
9. Запустить полный тест-ран
