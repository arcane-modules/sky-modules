# Sky Modules

**Fine-grained reactive system for TypeScript.** Decorators, validation, network sync, and more.

> ⚠️ **Alpha stage.** API is unstable, breaking changes expected.

## Packages

| Package | Description | Tests |
|---------|-------------|-------|
| [`@sky-modules/define`](packages/define) | Class/function/object registration with `@define()` | 23 |
| [`@sky-modules/schema`](packages/schema) | Standalone schema decorators (`@number`, `@string`, etc.) | 37 |
| [`@sky-modules/reactive`](packages/reactive) | Fine-grained reactivity with SolidJS signals, validation, lamps | 101 |
| [`@sky-modules/share`](packages/share) | Network sync for reactive lamps (flat key:value deltas) | 27 |
| [`@sky-modules/utilities`](packages/utilities) | Standalone utilities (Timer, retry, pipe, EventEmitter, etc.) | 70 |
| [`@sky-modules/platform`](packages/platform) | Platform detection (Cirrus, Node, Browser, Deno, Bun, etc.) | 9 |
| [`@sky-modules/testing`](packages/testing) | Testing helpers, benchmark, canvas mocks | 28 |
| [`@sky-modules/migration`](packages/migration) | Schema versioning and migration for reactive objects | 22 |
| [`@sky-modules/jsx`](packages/jsx) | Universal JSX runtime based on SolidJS | 6 |
| [`@sky-modules/vike`](packages/vike) | Vike integration helpers | 19 |
| [`@sky-modules/router`](packages/router) | Universal client-side router | 11 |
| [`@sky-modules/canvas`](packages/canvas) | 2D Canvas JSX renderer | 7 |
| [`@sky-modules/three`](packages/three) | Three.js JSX renderer | 4 |
| [`@sky-modules/universal`](packages/universal) | Fusion Components, design system, SlotRoot, robot3 | 6 |
| [`arbor`](packages/arbor) | (existing project) | 74 |

**Total: 502+ tests**

## Quick Start

### Установка

```bash
pnpm install
pnpm -r install
```

### Базовый пример

```typescript
import {
    define,
    number,
    string,
    registerReactiveHook,
} from '@sky-modules/define'

registerReactiveHook()

@define('game.Player')
class Player {
    @number.min(0).max(100) health = 100
    @string.nonEmpty() name = ''
}

const player = new Player()
player.health = 50  // реактивно, валидировано
```

### Сохранение и миграция

```typescript
import {
    save,
    load,
    registerMigration,
} from '@sky-modules/save'

// Регистрация миграции
registerMigration({
    version: '20241208_125510',
    from: '20241201_120000',
    up: {
        'game.Player': { add: { email: '' } },
    },
})

// Сохранение и загрузка с автоматической миграцией
const saved = save(player)
const loaded = load<Player>(saved)  // email = ''
```

### Сетевая синхронизация

```typescript
import { share, apply } from '@sky-modules/share'

// Сервер: share объект и отправлять дельты
const player = new Player()
share(player, (delta) => ws.send(JSON.stringify(delta)))

// Клиент: применять дельты
ws.onmessage = (event) => apply(JSON.parse(event.data))
```

### Утилиты

```typescript
import { Timer, retry, pipe, slugify } from '@sky-modules/utilities'

const timer = new Timer()
timer.reset()
await new Promise(resolve => setTimeout(resolve, 100))
console.log(timer.deltaTime())  // время прошло

const result = retry(() => {
    if (Math.random() > 0.5) throw new Error('Ошибка')
    return 'Успех'
}, 3)
```

### Детекция платформы

```typescript
import { isNode, isBrowser, isCirrus, arch, os } from '@sky-modules/platform'

console.log('Platform:', isNode ? 'node' : isBrowser ? 'browser' : isCirrus ? 'cirrus' : 'unknown')
console.log('Architecture:', arch)
console.log('OS:', os)
```

## Architecture

### Core Principles

1. **Fine-grained reactivity** — each property has its own SolidJS signal
2. **Decorator-first** — `@number`, `@string`, `@define()` for declarative schemas
3. **Network lamps** — isolated sync units, no graph traversal
4. **Standalone packages** — each package has zero or minimal dependencies

### Package Dependencies

```
@sky-modules/define     (standalone — registration, hooks, symbols)
       ↑
@sky-modules/schema     (depends on define — decorators via hooks)
       ↑
@sky-modules/reactive   (depends on define + schema — signals, validation, lamps)
       ↑
@sky-modules/share      (depends on define + reactive — network sync)
       ↑
@sky-modules/migration  (depends on define — schema versioning)
       ↑
@sky-modules/save       (depends on define + migration — persistence)
       ↑
@sky-modules/utilities  (standalone — zero dependencies)
@sky-modules/platform   (standalone — zero dependencies)
@sky-modules/testing    (standalone — vitest only)
@sky-modules/jsx        (peer: solid-js)
@sky-modules/vike       (peer: vike)
@sky-modules/router     (peer: @sky-modules/jsx)
@sky-modules/canvas     (peer: @sky-modules/jsx)
@sky-modules/three      (peer: @sky-modules/jsx, three)
@sky-modules/universal  (design system + Fusion Components)
@sky-modules/arbor      (existing project)
```

```
@sky-modules/utilities  (standalone — zero dependencies)
@sky-modules/platform   (standalone — zero dependencies)
@sky-modules/testing    (standalone — only vitest as devDep)
@sky-modules/jsx        (peer: solid-js)
@sky-modules/vike       (peer: vike)
@sky-modules/router     (peer: @sky-modules/jsx)
@sky-modules/canvas     (peer: @sky-modules/jsx)
@sky-modules/three      (peer: @sky-modules/jsx, three)
@sky-modules/universal  (design system + Fusion Components)
```

## Key Concepts

### Reactive Decorators

```typescript
@number                // basic number
@number.min(0).max(100)  // with validation
@string.email()        // string with email validation
@boolean               // boolean
@array.of(number)      // array of numbers
@object({ x: number, y: number })  // nested object
```

### Modifiers

```typescript
@read.number           // readable, not writable
@write.string          // writable, not readable
@secret.boolean        // excluded from serialization
```

### Network Lamps

```typescript
import { share, apply } from '@sky-modules/share'

// Server: share object, send deltas
const player = new Player()
share(player, (delta) => ws.send(JSON.stringify(delta)))

// Client: apply deltas
ws.onmessage = (event) => apply(JSON.parse(event.data))
```

## Documentation

Документация каждого пакета лежит в `packages/<name>/docs/{en,ru}` и собирается в сайт на VitePress. На страницах пакетов `arbor`, `canvas`, `jsx`, `reactive`, `router`, `three` есть живой playground (`pnpm play` внутри пакета).

```bash
pnpm docs:dev     # локальный сайт
pnpm docs:build   # сборка в docs/.vitepress/dist
```

## Development

```bash
# Install
pnpm install

# Run all tests
pnpm -r test

# Typecheck all packages
pnpm -r typecheck

# Add a new package
mkdir packages/my-package
cd packages/my-package
pnpm init
```

### Conventions

- **4 spaces** indentation, no semicolons
- **Strict TypeScript**, no `any`
- **Test files** in `src/*.test.ts` next to source files
- **Spec-first** — create `specs/package-name.md` before implementing
- **Zero external dependencies** for utilities (only TypeScript + vitest)
- **Tree-shakeable** — each utility a separate file, import by path

## License

MIT
