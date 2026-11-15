# @sky-modules/schema

Property decorators that describe the structure of a class. They build on `createPropertyDescriptor` from `@sky-modules/define`, so `@sky-modules/reactive` can turn every property reactive without changes to your classes.

## Quick start

```ts
import define from '@sky-modules/define'
import { array, number, string } from '@sky-modules/schema'

@define('game.Player')
class Player {
    @number x = 0
    @number y = 0
    @string name = ''
    @array(string) tags: string[] = []
}
```

## Type decorators

| Decorator | Property type |
| --- | --- |
| `@boolean`, `@number`, `@string`, `@bigint`, `@symbol` | primitives |
| `@date` | `Date` (stored as a string internally) |
| `@array(type)` | array of `type`, for example `@array(number)` |
| `@object(ClassOrSchema)` | nested class or schema object |
| `@map(keyType, valueType)` | `Map` |
| `@set(valueType)` | `Set` |

## Wrappers for optional values

`optional(schema)`, `nullable(schema)` and `nullish(schema)` widen a type with `undefined`, `null` or both.

## Sync modifiers

Modifiers control what `@sky-modules/share` sends over the network.

| Modifier | Meaning |
| --- | --- |
| `read` | server → client. The default. |
| `write` | bidirectional. |
| `secret` | excluded from synchronization. |

Use them as wrappers or as shortcuts for primitives:

```ts
class Account {
    @write.string nickname = ''
    @secret.string password = ''
}
```

Shortcuts exist for `boolean`, `number`, `string`, `bigint`, `symbol` and `date`. `unwrapType(schema)` returns `{ type, modifier }`. Modifiers affect only network sync: `@sky-modules/save` stores every field, including secret ones.

## Plain objects

| Function | Result |
| --- | --- |
| `makePlain(Class, initial?)` | Plain object with the schema fields of a new instance. `initial` overrides only keys that exist in the schema. |
| `createPlain(schema)` | Object with the schema keys, all `undefined`. |
| `hasSchema(target)` | Whether the prototype has a schema. |
| `getSchemaKeys(target)` | Array of schema keys, empty when there is no schema. |

```ts
const player = makePlain(Player, { x: 10 })
// { x: 10, y: 0, name: '', tags: [] }
```

## Types

`Plain<T>` extracts the plain object type from a schema class. Also exported: `Class`, `Schema`, `ExtractSchemaType`, `objectOf`, `TypeWithModifier`, `Modifier`.
