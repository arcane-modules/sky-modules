# Пакет `@sky-modules/schema`

## Контекст
`schema` — это **декораторы типов**. Определяет структуру классов через `@number`, `@string`, `@boolean`, `@array`, `@object` и т.д.

В старой архитектуре:
- **`@sky-modules/schema`** — standalone пакет с декораторами, использует `createPropertyDescriptor` из define
- **`@sky-modules/reactive`** — регистрирует hook, добавляя сигналы к декораторам
- **`@sky-modules/core/define`** — объединяет schema + reactive + share + validation

Новый `packages/schema/` — standalone, без зависимостей от reactive или solid-js.

## Цель
Создать пакет `@sky-modules/schema` с:
1. **Декораторы** — `@number`, `@string`, `@boolean`, `@bigint`, `@symbol`, `@date`, `@object()`, `@array()`, `@map()`, `@set()`
2. **Модификаторы** — `read()`, `write()`, `secret()`
3. **Nullability** — `optional()`, `nullable()`, `nullish()`
4. **Plain<T>** — тип для инференса plain-объекта из схемы
5. **makePlain / createPlain** — создание plain-объектов из схем
6. **Class<T>** — тип для конструктора класса

## Принципы
- **Zero runtime dependencies** (только TypeScript + `@sky-modules/define`)
- **Standalone** — не зависит от reactive или solid-js
- **Tree-shakeable**

## Состав

### 1. Декораторы (`src/types.ts`)

```typescript
import { createPropertyDescriptor, schemaSymbol, propertyIndexSymbol, primitiveTypeSymbol } from '@sky-modules/define'

@number x = 0
@string name = ''
@boolean isActive = false
@bigint id = 0n
@symbol key = Symbol()
@date createdAt = new Date()
@object(Address) address: Address | null = null
@array(string) tags: string[] = []
@map(string, number) scores: Map<string, number> = new Map()
@set(string) uniqueTags: Set<string> = new Set()
```

Каждый декоратор:
- Сохраняет метаданные в `target[schemaSymbol]`
- Создаёт property descriptor через `createPropertyDescriptor` (хук из define)
- По умолчанию — простой get/set
- Если reactive зарегистрировал hook — создаёт сигналы

### 2. Модификаторы

```typescript
@read.number health = 100     // Server → Client (default)
@write.number inputX = 0       // Bidirectional
@secret.string password = ''   // Excluded from sync
```

### 3. Nullability

```typescript
@optional.string email?: string
@nullable.string avatar: string | null
@nullish.string deletedAt: string | null | undefined
```

### 4. Plain<T> (`src/plain.ts`)

```typescript
type PlayerSchema = {
    x: typeof number
    y: typeof number
    name: typeof string
}
type PlayerPlain = Plain<PlayerSchema>
// { x: number, y: number, name: string }
```

### 5. makePlain / createPlain

```typescript
const player = makePlain(Player, { x: 10, y: 20 })
const empty = createPlain(PlayerSchema)
```

## Зависимости
- `@sky-modules/define` — для `createPropertyDescriptor`, символов, типов

## Тесты
- `src/types.test.ts` — декораторы создают правильные property descriptors
- `src/plain.test.ts` — Plain<T>, makePlain, createPlain
