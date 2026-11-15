# @sky-modules/share — Сетевая синхронизация

## Описание

Пакет `@sky-modules/share` предоставляет механизм сетевой синхронизации для реактивных объектов. В отличие от старого подхода с рекурсивным обходом графа объектов (GraphManager), новый подход использует **изолированные сетевые лампы (network lamps)**, где каждая лампа синхронизирует только своё собственное состояние через плоские key:value дельты.

## Ключевые принципы

- **Изолированные лампы** — нет рекурсивного обхода графа
- **Плоские дельты** — только `CREATE`, `SET`, `DESTROY` с key:value данными
- **Transport-agnostic** — пользователь предоставляет send callback
- **@define обязателен** — объекты должны быть зарегистрированы через `@define()`

## API

### `share(target, send)`

Начинает синхронизацию объекта. Немедленно отправляет `CREATE` дельту с полным состоянием. При каждом изменении отправляет `SET` дельту с изменившимися полями.

```typescript
import { share } from '@sky-modules/share'

const player = new Player()
share(player, (delta) => ws.send(JSON.stringify(delta)))
// → { type: 'CREATE', id: 1, class: 'game.Player', data: { x: 0, y: 0 } }
// → { type: 'SET', id: 1, data: { x: 10 } }  (при player.x = 10)
```

### `unshare(target)`

Останавливает синхронизацию объекта. Отписывается от изменений, но не отправляет `DESTROY`.

```typescript
unshare(player)
```

### `destroy(target)`

Останавливает синхронизацию и отправляет `DESTROY` дельту.

```typescript
destroy(player)
// → { type: 'DESTROY', id: 1 }
```

### `isShared(target)`

Проверяет, синхронизируется ли объект.

```typescript
isShared(player) // → true / false
```

### `apply(delta)`

Применяет дельту к локальному реестру объектов. Создаёт, обновляет или удаляет объекты.

```typescript
import { apply } from '@sky-modules/share'

apply({ type: 'CREATE', id: 1, class: 'game.Player', data: { x: 0, y: 0 } })
apply({ type: 'SET', id: 1, data: { x: 10 } })
apply({ type: 'DESTROY', id: 1 })
```

### `registerObject(obj)` / `unregisterObject(id)`

Низкоуровневое управление реестром объектов. Используется внутри `share()` и `apply()`.

### `getClassUid(target)`

Возвращает UID класса, зарегистрированного через `@define()`. Используется для `CREATE` дельт.

### `serializeObject(target)` / `deserializeObject(data)`

Сериализация/десериализация объектов для передачи по сети. Поддерживает:
- Примитивы
- Массивы
- Date
- Map
- Set
- Вложенные объекты
- @define объекты (сериализуются как ID)

## Типы дельт

```typescript
type CreateDelta = {
    type: 'CREATE'
    id: number
    class: string
    data: Record<string, unknown>
}

type SetDelta = {
    type: 'SET'
    id: number
    data: Record<string, unknown>
}

type DestroyDelta = {
    type: 'DESTROY'
    id: number
}

type Delta = CreateDelta | SetDelta | DestroyDelta
```

## Пример использования

### Сервер (Node.js + WebSocket)

```typescript
import { WebSocketServer } from 'ws'
import { share, apply } from '@sky-modules/share'
import { define, number } from '@sky-modules/reactive'

@define('game.Player')
class Player {
    @number x = 0
    @number y = 0
}

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
    const player = new Player()

    // Отправляем изменения клиенту
    share(player, (delta) => ws.send(JSON.stringify(delta)))

    // Принимаем изменения от клиента
    ws.on('message', (data) => {
        apply(JSON.parse(data.toString()))
    })

    ws.on('close', () => destroy(player))
})
```

### Клиент (Browser)

```typescript
import { apply } from '@sky-modules/share'

const ws = new WebSocket('ws://localhost:8080')

ws.onmessage = (event) => {
    apply(JSON.parse(event.data))
}

// Отправляем изменения на сервер
function movePlayer(x: number, y: number) {
    ws.send(JSON.stringify({
        type: 'SET',
        id: 1,
        data: { x, y },
    }))
}
```

## Зависимости

- `@sky-modules/define` — для `@define()`, `idSymbol`, `uidSymbol`
- `@sky-modules/reactive` — для `SignalLamp`, `registerReactiveHook()`

## Тесты

- `src/share.test.ts` — 27 тестов
  - serialize: 10 тестов
  - apply: 7 тестов
  - share/unshare/destroy: 10 тестов
