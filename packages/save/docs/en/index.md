# @sky-modules/save

Persistence for schema classes: `save` turns a value into a JSON string, `load` restores class instances from it.

Unlike `@sky-modules/share`, `save` writes **all** fields, including `@secret` ones. Modifiers only affect network sync.

## Quick start

```ts
import define from '@sky-modules/define'
import { number, string } from '@sky-modules/schema'
import { load, save } from '@sky-modules/save'

@define('app.User')
class User {
    @string name = 'Anna'
    @number age = 25

    greet() {
        return `Hello ${this.name}`
    }
}

const json = save(new User())
// {"class":"app.User","id":1,"version":null,"data":{"name":"Anna","age":25}}

const restored = load<User>(json)
restored instanceof User // true
restored.greet() // "Hello Anna"
```

## Format

An object registered with `define` becomes:

```ts
interface SerializedData {
    class: string // define name, for example 'app.User'
    id: number // instance id
    version: string | null // migration version; save currently writes null
    data: Record<string, unknown>
}
```

Other values:

- Plain objects and arrays are serialized recursively.
- `Map`, `Set`, `Date` and `RegExp` are written as `{ "__type": "Map" | "Set" | "Date" | "RegExp", ... }` and restored to the same types.
- Schema fields are read first, then any own properties that are not in the schema.

## API

### `save(value, options?)`

Returns a JSON string.

### `load<T>(json, options?)`

Parses the string and rebuilds instances. For each `{ class, data }` record:

1. The class name is resolved through aliases from `@sky-modules/migration`.
2. Migrations are applied when the stored version differs from the current one.
3. An instance is created from the `define` registry. Properties with setters (reactive ones) are assigned through the setter, others are defined directly.
4. The stored `id` is restored.

An unknown class throws `Unknown class: ...` with a hint to register it with `@define` before calling `load`.

### Lower level

`serializeWithMetadata(value)` returns the serializable object, `deserializeWithMetadata(parsed)` restores values from a parsed object. Types: `SerializedData`, `SerializedSpecialType`, `SaveOptions`, `LoadOptions`.

`SaveOptions` and `LoadOptions` accept `unsafe`, which is reserved: the schema check is not performed by the current implementation.
