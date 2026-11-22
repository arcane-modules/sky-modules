# @sky-modules/reactive

Fine-grained reactivity for schema classes. Importing the package registers a property descriptor hook in `@sky-modules/define`, so the decorators from `@sky-modules/schema` create properties backed by Solid 2 signals. A value written to a property is readable immediately; subscribed effects are notified in Solid batches (after a microtask or `flush()`), and writes from inside effects are allowed. It adds chainable validation, change tracking (`SignalLamp`) and reactive arrays.

## Quick start

```ts
import { number, string, SignalLamp } from '@sky-modules/reactive'

class Player {
    @number.min(0).max(100) health = 100
    @string.nonEmpty() name = ''
    lamp = new SignalLamp(this)
}

const player = new Player()
player.lamp.onSync((delta) => console.log(delta))
player.health = 50 // after a microtask: { health: 50 }
```

`registerReactiveHook()` is exported for explicit registration. Loading the decorators already calls it once.

## Decorators

The same set as `@sky-modules/schema`, but with validation chains:

`number`, `string`, `boolean`, `bigint`, `symbol`, `date`, `array`, `object`, `map`, `set`, plus the wrappers `optional`, `nullable`, `nullish` and the sync modifiers `read`, `write`, `secret`.

### Validation chains

| Decorator | Methods |
| --- | --- |
| `string` | `min(n)`, `max(n)` (length), `pattern(regex)`, `email()`, `url()`, `uuid()`, `nonEmpty()`, `refine(fn, message)`, `use(name)` |
| `number` | `min(n)`, `max(n)`, `integer()`, `positive()`, `negative()`, `nonNegative()`, `finite()`, `refine(fn, message)`, `use(name)` |
| `array(type)` | `minLength(n)`, `maxLength(n)`, `nonEmpty()`, `unique()`, `refine(fn, message)`, `use(name)` |
| `object(schema)` | `required()`, `refine(fn, message)`, `use(name)` |

Every method takes an optional message as its last argument (`refine` requires one). Rules are stored with the schema and do **not** run on assignment. Run them with `validate`:

```ts
import { validate } from '@sky-modules/reactive'

const result = validate(player)
// { valid: boolean, errors: [{ path, message, rule }] }
```

`refine` and `use` rules skip `null` and `undefined` values.

### Custom validators

```ts
import { extendString, number, string } from '@sky-modules/reactive'

extendString('noSpaces', (value) => !value.includes(' '), 'Spaces are not allowed')

class Account {
    @string.use('noSpaces') login = ''
}
```

`extendNumber`, `extendArray`, `extendObject` and `extendFunc` work the same way. Using an unknown name throws `String extension 'x' not found` (or the matching type).

## SignalLamp

An isolated sync unit, a field on your object (composition, not inheritance).

| Member | Purpose |
| --- | --- |
| `new SignalLamp(target)` | Starts observing reactive properties of `target`. |
| `onSync(callback)` | Subscribes to deltas (flat `{ key: value }`). Returns an unsubscribe function. |
| `getSnapshot()` | Plain object with the current values, including prototype getters. |
| `committed()` | Promise that resolves after pending deltas are delivered. |
| `target` | The observed object. |

Changes made in the same tick are batched into one callback through a microtask. This is what `@sky-modules/share` uses to send deltas.

## signal

`signal(initial)` returns a proxy where each property is reactive (Solid 2 signals, same read-after-write semantics). `getRawValue(proxy)` returns raw data and `isSignal(value)` checks for such a proxy.

## reactiveArray

```ts
import { reactiveArray } from '@sky-modules/reactive'

const items = reactiveArray([1, 2, 3], (event, array) => {
    console.log(event)
})
items.push(4) // { type: 'push', items: [4] }
```

Mutators: `push`, `pop`, `shift`, `unshift`, `splice`, `set(index, value)`, `clear()`. Readers: `length`, indexing, iterators, `includes`, `indexOf`, `toArray()`. Change events:

| `type` | Fields |
| --- | --- |
| `push`, `unshift` | `items` |
| `pop`, `shift` | `item` |
| `splice` | `start`, `deleteCount`, `items` |
| `set` | `index`, `value` |
| `clear` | none |

`isReactiveArray(value)` and `getInternalArray(arr)` are available from `@sky-modules/reactive/lamps`.

## Plain reactive objects

The subpath export `@sky-modules/reactive/define` exposes `define`. `makePlain(schema)` returns a constructor that creates plain reactive objects from a schema object, `createPlain(schema, initial?)` is the shorthand, `isPlain(obj)` and `getPlainSchema(obj)` inspect them.

## Types

`ExtractSchemaType`, `Schema`, `Shared`, `TypeWithModifier`, `ValidationResult`, `FieldError`, `ValidationRule`, `ValidatorFn`, `SyncCallback`, `ReactiveArray`, `ArrayChangeEvent`, `ArrayChangeCallback`.

## Playground

<Playground name="reactive" />
