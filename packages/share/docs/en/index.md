# @sky-modules/share

Network sync for reactive objects. Each object is an isolated sync unit that sends flat key/value deltas through a transport you provide.

## Quick start

```ts
import define from '@sky-modules/define'
import { number } from '@sky-modules/schema'
import { apply, share } from '@sky-modules/share'

@define('game.Player')
class Player {
    @number x = 0
    @number y = 0
}

// Server
const player = new Player()
share(player, (delta) => socket.send(JSON.stringify(delta)))
player.x = 10 // a SET delta is sent automatically

// Client
socket.onmessage = (event) => apply(JSON.parse(event.data))
```

`share` requires `@sky-modules/reactive` (it observes the object through `SignalLamp`) and a class registered with `@define`; without `@define` it throws.

## Deltas

| Delta | Fields | Sent when |
| --- | --- | --- |
| `CREATE` | `id`, `class`, `data` (full state) | `share(obj, send)` is called. |
| `SET` | `id`, `data` (changed keys only) | A property changes. |
| `DESTROY` | `id` | `destroy(obj)` is called. |

## Sender API

| Function | Behavior |
| --- | --- |
| `share(target, send)` | Sends `CREATE`, then `SET` on every change. Sharing the same object twice does nothing. |
| `unshare(target)` | Stops sending, no `DESTROY`. |
| `destroy(target)` | Sends `DESTROY`, then unshares. |
| `isShared(target)` | Whether the object is shared. |
| `sharedCount()` | Number of shared objects. |
| `clearShareStates()` | Unsubscribes everything (for tests). |

## Receiver API

`apply(delta)` updates the registry and returns the affected object (`undefined` for `DESTROY`, or for `SET` with an unknown `id`):

- `CREATE` instantiates the class registered under `class` and registers it by `id`. An unknown class throws.
- `SET` writes the changed properties on the registered object.
- `DESTROY` removes the object from the registry.

Registry helpers: `registerObject`, `unregisterObject`, `getObjectById`, `getAllObjects`, `clearRegistry`, `resetIdCounter`.

## Serialization helpers

`serializeObject`, `deserializeObject`, `getClassUid`, `getInstanceId`. Nested objects, arrays, `Date`, `Map` and `Set` are supported.

## Types

`Delta`, `CreateDelta`, `SetDelta`, `DestroyDelta`, `SendCallback`, `ReceiveCallback`.
