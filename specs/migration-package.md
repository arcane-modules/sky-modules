# @sky-modules/migration — Schema versioning & migration

## Описание

Пакет `@sky-modules/migration` предоставляет механизм версионирования схемы и автоматической миграции данных. Позволяет эволюционировать схему классов без потери данных — старые сохранения автоматически преобразуются к новой версии при загрузке.

## Ключевые принципы

- **Версионирование** — каждая версия схемы имеет timestamp (например, `20241208_125510`)
- **Цепочка миграций** — миграции применяются последовательно от старой версии к новой
- **Декларативные изменения** — add, remove, rename, transform
- **Алиасы классов** — переименование классов без потери данных
- **Интеграция с save/load** — `load()` автоматически применяет миграции

## API

### `registerMigration(migration)`

Регистрирует одну миграцию.

```typescript
import { registerMigration } from '@sky-modules/migration'

registerMigration({
    version: '20241208_125510',
    name: 'add_user_email',
    from: '20241201_120000',
    up: {
        'app.User': {
            add: { email: '' },
        },
    },
})
```

### `registerMigrations(migrations)`

Регистрирует несколько миграций сразу.

```typescript
import * as migrations from './migrations'
registerMigrations(Object.values(migrations))
```

### `getCurrentVersion()` / `setCurrentVersion(version)`

Управление текущей версией схемы.

### `registerAlias(oldName, newName)`

Регистрирует алиас для переименованного класса.

```typescript
registerAlias('app.Player', 'app.GamePlayer')
```

### `resolveClassName(className)`

Разрешает имя класса через алиасы.

### `applyMigrations(className, data, fromVersion, toVersion)`

Применяет цепочку миграций к данным.

### `getMigrationChain(fromVersion, toVersion)`

Возвращает массив миграций для применения.

## Формат миграции

```typescript
interface Migration {
    version: string           // Timestamp (e.g., '20241208_125510')
    name: string              // Human-readable name
    from: string | null       // Previous version (null for initial)
    up: Record<string, MigrationFieldChanges>  // Changes per class
}

interface MigrationFieldChanges {
    add?: Record<string, unknown>      // Add fields with defaults
    remove?: string[]                   // Remove fields
    rename?: Record<string, string>    // Rename fields (old → new)
    transform?: (data: Record<string, unknown>) => Record<string, unknown>  // Custom transform
}
```

## Интеграция с save/load

При загрузке данных, `load()` проверяет версию и автоматически применяет миграции:

```typescript
const json = '{"class":"app.User","id":1,"version":"20241201_120000","data":{"name":"Anna"}}'
const restored = load<User>(json)
// Миграции применены: email добавлен с дефолтным значением ''
```

## Зависимости

- `@sky-modules/define` — для `defines`, `uidSymbol`

## Тесты

- `src/migration.test.ts` — ~15 тестов
  - registerMigration / registerMigrations
  - getCurrentVersion / setCurrentVersion
  - getMigrationChain
  - applyMigrations (add, remove, rename, transform)
  - registerAlias / resolveClassName
  - Интеграция с save/load

## План реализации

1. Создать `packages/migration/` с package.json, tsconfig, vitest.config
2. Реализовать `src/types.ts` — типы миграций
3. Реализовать `src/migration.ts` — регистрация, цепочка, применение
4. Реализовать `src/index.ts` — public API
5. Написать тесты
6. Интегрировать с `packages/save` (load автоматически применяет миграции)
7. Добавить в `packages/core`
8. Запустить полный тест-ран
