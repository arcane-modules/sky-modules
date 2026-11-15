# @sky-modules/share

Сетевая синхронизация реактивных объектов. Каждый объект — изолированная единица синхронизации, которая отправляет плоские дельты «ключ-значение» через транспорт, который вы предоставляете.

## Быстрый старт

```ts
import define from '@sky-modules/define'
import { number } from '@sky-modules/schema'
import { apply, share } from '@sky-modules/share'

@define('game.Player')
class Player {
    @number x = 0
    @number y = 0
}

// Сервер
const player = new Player()
share(player, (delta) => socket.send(JSON.stringify(delta)))
player.x = 10 // дельта SET отправляется автоматически

// Клиент
socket.onmessage = (event) => apply(JSON.parse(event.data))
```

`share` требует `@sky-modules/reactive` (он наблюдает за объектом через `SignalLamp`) и класс, зарегистрированный через `@define`; без `@define` выбрасывает ошибку.

## Дельты

| Дельта | Поля | Когда отправляется |
| --- | --- | --- |
| `CREATE` | `id`, `class`, `data` (полное состояние) | Вызван `share(obj, send)`. |
| `SET` | `id`, `data` (только изменённые ключи) | Изменилось свойство. |
| `DESTROY` | `id` | Вызван `destroy(obj)`. |

## API отправителя

| Функция | Поведение |
| --- | --- |
| `share(target, send)` | Отправляет `CREATE`, затем `SET` при каждом изменении. Повторный `share` того же объекта ничего не делает. |
| `unshare(target)` | Прекращает отправку, `DESTROY` не отправляется. |
| `destroy(target)` | Отправляет `DESTROY`, затем делает `unshare`. |
| `isShared(target)` | Расшарен ли объект. |
| `sharedCount()` | Количество расшаренных объектов. |
| `clearShareStates()` | Отписывает всё (для тестов). |

## API получателя

`apply(delta)` обновляет реестр и возвращает затронутый объект (`undefined` для `DESTROY` или для `SET` с неизвестным `id`):

- `CREATE` создаёт экземпляр класса, зарегистрированного под `class`, и регистрирует его по `id`. Неизвестный класс выбрасывает ошибку.
- `SET` записывает изменённые свойства в зарегистрированный объект.
- `DESTROY` удаляет объект из реестра.

Помощники реестра: `registerObject`, `unregisterObject`, `getObjectById`, `getAllObjects`, `clearRegistry`, `resetIdCounter`.

## Помощники сериализации

`serializeObject`, `deserializeObject`, `getClassUid`, `getInstanceId`. Поддерживаются вложенные объекты, массивы, `Date`, `Map` и `Set`.

## Типы

`Delta`, `CreateDelta`, `SetDelta`, `DestroyDelta`, `SendCallback`, `ReceiveCallback`.
