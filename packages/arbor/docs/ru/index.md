# Arbor

**Runtime для управления владением, жизненным циклом, контекстами и dispatch событий по дереву.**

Вдохновлён моделью владения Rust.

## Установка

```bash
npm install @sky-modules/arbor
```

## Быстрый старт

```typescript
import { ArborTree, ArborNode, invoke } from '@sky-modules/arbor'

const tree = new ArborTree()

const node = new ArborNode(() => {
    const timer = setInterval(() => console.log('tick'), 1000)
    return () => clearInterval(timer)
}, tree)

tree.commit()

await node.dispose()
```

## Основные концепты

- **ArborTree** — корень, очереди операций, IO hooks
- **ArborNode** — owned resource, multi-parent, автоматический dispose
- **Contexts** — DI вниз по дереву с cleanup hooks
- **Events** — dispatch сверху вниз и снизу вверх
- **@invoke** — хуки в стиле Minecraft модов на методы класса

## API

```typescript
// Создание и commit
const tree = new ArborTree()
const node = new ArborNode(() => cleanup, tree)
tree.commit()

// Контексты
tree.addContext(new AppConfig())
tree.commit()
node.context(AppConfig) // throws if missing
node.maybeContext(AppConfig) // undefined if missing

// События
node.dispatch('onCustomEvent', { data: 42 })
node.dispatchReverse('onCustomEvent', { data: 42 })

// IO (только на ArborTree)
tree.registerUpdateEvents()
tree.registerMouseEvents()
tree.registerEmitKeyboardEvents()
tree.registerGamepadEvents()
```

См. README.md (англ.) для полной документации.

## Playground

<Playground name="arbor" />
