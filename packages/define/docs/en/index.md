# @sky-modules/define

A registrar for classes, functions, and objects with stable names and numeric IDs.

## Quick start

```ts
import define from '@sky-modules/define'

// As a class decorator
@define('app.MyService')
class MyService {}

// As a function: registers and returns the value
const helper = define('app.utils.helper', function helper() {
    return 'help'
})

// Objects and arrays are registered too
define('app.config', { apiUrl: 'https://api.example.com' })
```

## Rules

- A name must match `/^[a-zA-Z][a-zA-Z0-9_.]*$/`.
- The last segment of the dotted name becomes the short name.
- Classes get a numeric id. The id is stable when it was loaded earlier through `loadedDefines`, otherwise it is taken from `nextUniqueId()`.
- Defining the same name again after `startRuntime()` throws `DuplicateDefineError`. Any define after startup throws `RuntimeDefineError`, except during hot reload.

## Runtime lifecycle

```ts
import { runBeforeRuntime, startRuntime } from '@sky-modules/define'

runBeforeRuntime(() => {
    // deferred registration, avoids circular imports
})

await startRuntime() // runs queued callbacks, then switches to runtime mode
```

`runBeforeRuntime(cb)` runs `cb` immediately in runtime mode and otherwise queues it. `setRuntime` and `setHot` switch the modes manually.

## Hot reload

Register handlers to be notified when a name is redefined while `isHot()` is true:

```ts
import { registerHotClassHandler, registerHotValueHandler } from '@sky-modules/define'

registerHotValueHandler((name, oldValue, newValue) => {})
registerHotClassHandler((name, oldClass, newClass) => {})
```

## Errors

| Class | When |
| --- | --- |
| `DefineError` | Base class of all errors below. |
| `InvalidDefineNameError` | The name does not match the pattern, or the value is not an object or function. |
| `DuplicateDefineError` | The name is already defined at runtime. |
| `RuntimeDefineError` | Defining at runtime outside hot reload. |
| `RecursiveDefineError` | A define calls itself (directly or through imports). The message shows the stack. |

## Registry and state

`defines` holds every registered value. `loadedDefines` maps names to ids loaded from a schema file. Helpers: `getUniqueId`, `setUniqueId`, `nextUniqueId`, `getSchemaLoaded`, `setSchemaLoaded`.

Metadata is stored under symbols: `idSymbol`, `typeSymbol` (`class`, `func`, `object`, `array`), `nameSymbol`, `uidSymbol`, plus `schemaSymbol` and others used by `@sky-modules/schema`.

## Property descriptor hooks

`createPropertyDescriptor` and `createPropertyDescriptorMap` build plain getter/setter descriptors by default. Other packages (for example `reactive`) replace them via `registerPropertyDescriptorHook` and `registerPropertyDescriptorMapHook`, so `define` stays free of reactive dependencies.

## Types

`Modifier` (`read`, `write`, `secret`), `PropertyMeta`, `Static`, `Shared`, `Defines`, `UpdateOfSharedCallback`, `ListenersStorage`.
