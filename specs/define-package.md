# Пакет `@sky-modules/define`

## Контекст
`define` — это **регистратор**. Тонкий слой, который регистрирует всё: классы, функции, объекты — с уникальными строковыми ID.

В старом проекте `EmptySet/_inbox/sky-modules`:
- **`@sky-modules/define`** — standalone пакет с core регистрацией
- **`@sky-modules/core/define`** — расширения: observe, share, plain, save/load, serialize, schema, migration, reactive, validation

Новый `packages/define/` будет тонким регистратором. Расширения (observe, share, save/load, schema) — отдельные пакеты.

## Цель
Создать пакет `@sky-modules/define` с:
1. **`@define(name)`** — декоратор/функция для регистрации классов, функций, объектов
2. **Символы** — `idSymbol`, `typeSymbol`, `nameSymbol`, `uidSymbol`, `modifierSymbol`, `propertyIndexSymbol`, `schemaMetaSymbol`, `primitiveTypeSymbol`
3. **Состояние** — `defines`, `loadedDefines`, `nextUniqueId`
4. **Хуки** — `registerPropertyDescriptorHook`, `createPropertyDescriptor` (для реактивности)
5. **Runtime** — `isRuntime`, `isHot`, `runBeforeRuntime`, `startRuntime`
6. **Ошибки** — `DefineError`, `DuplicateDefineError`, `InvalidDefineNameError`, `RuntimeDefineError`, `RecursiveDefineError`
7. **Типы** — `Static`, `Shared`, `PropertyMeta`, `Modifier`, `Defines`, `ListenersStorage`

## Принципы
- **Zero dependencies**
- **Standalone** — не зависит от других пакетов
- **Tree-shakeable**

## Состав

### 1. `@define()` — декоратор/функция

```typescript
import define from '@sky-modules/define'

// Как декоратор класса
@define('app.MyService')
class MyService {
    doSomething() {}
}

// Как функция
define('app.utils.helper', function helper() {
    return 'help'
})

define('app.config', { apiUrl: 'https://api.example.com' })
```

- Валидация имени: `/^[a-zA-Z][a-zA-Z0-9_.]*$/`
- Защита от дубликатов: `DuplicateDefineError`
- Защита от рекурсии: `RecursiveDefineError`
- HMR поддержка: `isHot()`, `notifyHotValueUpdate`, `notifyHotClassUpdate`
- Установка символов: `typeSymbol`, `nameSymbol`, `uidSymbol`, `idSymbol`

### 2. Символы

```typescript
import {
    idSymbol, typeSymbol, nameSymbol, uidSymbol,
    modifierSymbol, propertyIndexSymbol,
    schemaMetaSymbol, primitiveTypeSymbol,
    constructorSymbol, listenersOfSharedSymbol,
    isSetStorageSymbol,
} from '@sky-modules/define'
```

### 3. Состояние

```typescript
import {
    defines, loadedDefines,
    nextUniqueId, getUniqueId, setUniqueId,
    getSchemaLoaded, setSchemaLoaded,
} from '@sky-modules/define'
```

### 4. Хуки (для реактивности)

```typescript
import {
    registerPropertyDescriptorHook,
    createPropertyDescriptor,
    createPropertyDescriptorMap,
} from '@sky-modules/define'
```

Позволяет `@sky-modules/reactive` подключать SolidJS сигналы без прямой зависимости.

### 5. Runtime

```typescript
import {
    isRuntime, isHot,
    setRuntime, setHot,
    runBeforeRuntime, startRuntime,
    registerHotValueHandler, registerHotClassHandler,
} from '@sky-modules/define'
```

### 6. Ошибки

```typescript
import {
    DefineError, DuplicateDefineError,
    InvalidDefineNameError, RuntimeDefineError,
    RecursiveDefineError,
} from '@sky-modules/define'
```

### 7. Типы

```typescript
import {
    Modifier,  // READ | WRITE | SECRET
} from '@sky-modules/define'
import type {
    Static, Shared, PropertyMeta,
    Defines, ListenersStorage,
    UpdateOfSharedCallback,
} from '@sky-modules/define'
```

## Структура файлов

```
packages/define/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── define.ts
│   ├── define.test.ts
│   ├── internal/
│   │   ├── index.ts
│   │   ├── symbols.ts
│   │   ├── state.ts
│   │   ├── runtime.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── errors.ts
│   └── errors.test.ts
```

## Критерии успеха
- [ ] Все тесты проходят
- [ ] Typecheck чист
- [ ] Zero dependencies
- [ ] API соответствует примерам
- [ ] `@define()` работает как декоратор и как функция
- [ ] Хуки позволяют reactive подключать сигналы