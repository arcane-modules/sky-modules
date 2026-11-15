# Sky Modules — API Reference

> **Alpha stage** — API is unstable, breaking changes expected.

## Table of Contents

- [define](#sky-modulesdefine)
- [schema](#sky-modulesschema)
- [reactive](#sky-modulesreactive)
- [share](#sky-modulesshare)
- [save](#sky-modulessave)
- [migration](#sky-modulesmigration)
- [utilities](#sky-modulesutilities)
- [platform](#sky-modulesplatform)
- [testing](#sky-modules-testing)
- [jsx](#sky-modulesjsx)
- [vike](#sky-modulesvike)
- [router](#sky-modulesrouter)
- [canvas](#sky-modulescanvas)
- [three](#sky-modulesthree)

---

## @sky-modules/define

**Registration layer for classes, functions, objects.**

### Installation

```bash
pnpm add @sky-modules/define
```

### Usage

```typescript
import define from '@sky-modules/define'

@define('app.User')
class User {
    name: string
    age: number
}
```

### API

#### `define(name, value?)`

Registers a class, function, or object with a stable ID.

**Parameters:**
- `name` (string): Registration ID (e.g., `'app.User'`)
- `value` (optional): The class/function/object to register. If omitted, current class is used.

**Returns:** `void`

**Example:**

```typescript
// Register class
@define('app.User')
class User { name: string }

// Register function
define('app.utils.helper', function helper() { return 'help' })

// Register object
define('app.config', { apiUrl: 'https://api.example.com' })
```

#### Errors

- `DuplicateDefineError` — Class already registered with same ID
- `InvalidDefineNameError` — Invalid registration ID format
- `RuntimeDefineError` — Registration failed during execution
- `RecursiveDefineError` — Circular dependency detected

---

## @sky-modules/schema

**Standalone schema decorators (no reactive dependency).**

### Installation

```bash
pnpm add @sky-modules/schema
```

### Usage

```typescript
import { number, string, boolean, array, object } from '@sky-modules/schema'

class Player {
    @number x: number
    @number y: number
    @string name: string
}
```

### API

#### Primitive Types

- `number<T>` — number type
- `string<T>` — string type
- `boolean<T>` — boolean type
- `bigint<T>` — bigint type
- `symbol<T>` — symbol type
- `date<T>` — Date type
- `symbol<T>` — symbol type

#### Container Types

- `array<T>` — array of type T
- `map<K, V>` — `Map<K, V>`
- `set<T>` — `Set<T>`
- `object<T>` — plain object with schema
- `optional<T>` — optional field
- `nullable<T>` — nullable field
- `nullish<T>` — nullish field

#### Modifiers

- `read<T>` — readable, not writable
- `write<T>` — writable, not readable
- `secret<T>` — excluded from serialization

#### Chaining

```typescript
@number.min(0).max(100)      // min/max
@string.nonEmpty().max(100)   // nonEmpty + max
@string.email()               // email validation
```

---

## @sky-modules/reactive

**Fine-grained reactive system with SolidJS signals.**

### Installation

```bash
pnpm add @sky-modules/reactive
```

### Usage

```typescript
import { registerReactiveHook } from '@sky-modules/reactive'

registerReactiveHook()

// Now all schema decorators create reactive properties
class Player {
    @number.min(0).max(100) health = 100
    @string.nonEmpty() name = ''
}
```

### API

#### `registerReactiveHook()`

Registers the reactive property descriptor hook. Call once at application startup.

**Returns:** `void`

**Example:**

```typescript
import { registerReactiveHook } from '@sky-modules/reactive'

registerReactiveHook()
```

#### `reactivePropertyDescriptor()`

Creates a reactive property descriptor with SolidJS signals. Used internally by schema decorators.

#### Signal Lamps

```typescript
import { SignalLamp } from '@sky-modules/reactive'

class Player {
    lamp = new SignalLamp(this)
}
```

**Methods:**
- `onSync(callback)` — subscribe to sync updates
- `getSnapshot()` — get current state snapshot
- `reset()` — reset lamp state

---

## @sky-modules/share

**Network sync for reactive lamps (isolated units, no graph traversal).**

### Installation

```bash
pnpm add @sky-modules/share
```

### Usage

```typescript
import { share, apply } from '@sky-modules/share'

// Server: share object and send deltas
const player = new Player()
share(player, (delta) => ws.send(JSON.stringify(delta)))

// Client: apply deltas
ws.onmessage = (event) => apply(JSON.parse(event.data))
```

### API

#### `share(obj, callback)`

Shares an object for network sync. Sets up change listener and sends deltas.

**Parameters:**
- `obj` — object to share
- `callback(delta)` — called when object changes

**Returns:** `void`

#### `unshare(obj)`

Removes object from share registry.

#### `destroy(obj)`

Destroys a shared object and removes from registry.

#### `isShared(obj)`

Checks if object is shared.

#### `apply(data)`

Applies deltas to registered objects.

#### `registerObject(obj)`

Manually registers an object for sync.

#### `serializeObject(obj)`

Serializes object for network transmission.

#### `deserializeObject(data)`

Deserializes data back to object.

---

## @sky-modules/save

**JSON persistence with class metadata.**

### Installation

```bash
pnpm add @sky-modules/save
```

### Usage

```typescript
import { save, load } from '@sky-modules/save'

const json = save(user)
const loaded = load<User>(json)
```

### API

#### `save(obj)`

Serializes object to JSON with class metadata.

**Parameters:**
- `obj` — object to serialize

**Returns:** `SerializedData` — JSON string with class metadata

**Example:**

```typescript
const json = save(user)
// {
//   "class": "app.User",
//   "id": 0,
//   "version": null,
//   "data": { ... }
// }
```

#### `load<T>(json)`

Deserializes JSON back to typed object with class restoration.

**Parameters:**
- `json` — JSON string from `save()`

**Returns:** `T` — deserialized instance

**Example:**

```typescript
const loaded = load<User>(json)  // User instance
```

#### `serializeWithMetadata(obj)`

Alternative save function with explicit metadata.

#### `deserializeWithMetadata(json)`

Alternative load function with explicit metadata.

---

## @sky-modules/migration

**Schema versioning and migration for reactive objects.**

### Installation

```bash
pnpm add @sky-modules/migration
```

### Usage

```typescript
import { registerMigration } from '@sky-modules/migration'

registerMigration({
    version: '20241208_125510',
    from: '20241201_120000',
    up: {
        'app.User': {
            add: { email: '' },
        },
    },
})

// load() automatically applies migrations
const loaded = load<User>(json)  // email = ''
```

### API

#### `registerMigration(migration)`

Registers a single migration.

**Parameters:**
- `migration` — migration definition with version, from, up/down

**Returns:** `void`

#### `registerMigrations(migrations)`

Registers multiple migrations at once.

#### `registerAlias(oldName, newName)`

Registers an alias for class name (backwards compatibility).

#### `getCurrentVersion()`

Gets current schema version.

#### `applyMigrations(className, data, fromVersion, toVersion)`

Manually applies migrations.

**Example:**

```typescript
registerMigration({
    version: '20241208_125510',
    from: '20241201_120000',
    up: {
        'app.User': {
            add: { email: '' },
        },
    },
})
```

---

## @sky-modules/utilities

**Standalone utility functions (zero dependencies).**

### Installation

```bash
pnpm add @sky-modules/utilities
```

### Usage

```typescript
import { Timer, retry, pipe, slugify, EventEmitter } from '@sky-modules/utilities'
```

### API

#### Timer

```typescript
import { Timer } from '@sky-modules/utilities'

const timer = new Timer()
timer.reset()
await new Promise(resolve => setTimeout(resolve, 100))
console.log(timer.deltaTime())  // elapsed time
```

**Methods:**
- `reset()` — reset timer
- `deltaTime()` — get elapsed milliseconds
- `log(label?)` — log elapsed time
- `label` — get label

#### `retry(fn, options?)`

Retries a function with exponential backoff.

**Parameters:**
- `fn` — async function to retry
- `options` — `{ attempts, delay, backoff, maxDelay, retryIf, onRetry }`

**Returns:** `Promise<T>` — result of function

#### `pipe(...fns)`

Functional composition. Pipes value through functions.

#### `slugify(text)`

Converts text to URL-friendly slug.

**Example:**

```typescript
slugify('Привет мир!')  // 'privet-mir'
```

#### `truncate(text, maxLength, end = '...')`

Truncates text to maxLength.

#### `template(str, data)`

String templating with placeholders.

#### `sleep(ms)`

Sleep for ms milliseconds.

#### `assert(condition, message?)`

Runtime assertion.

#### `justTry(fn)`

Try-catch wrapper that returns result or error.

#### `switchThread(fn)`

Thread switching utility.

#### `deferred()`

Creates a deferred promise.

#### `measurePerformance(fn)`

Performance measurement utility.

#### `repeat(fn, times)`

Repeats function execution.

---

## @sky-modules/platform

**Platform detection (Cirrus-first).**

### Installation

```bash
pnpm add @sky-modules/platform
```

### Usage

```typescript
import { isNode, isBrowser, isCirrus, arch, os } from '@sky-modules/platform'

console.log('Platform:', isNode ? 'node' : isBrowser ? 'browser' : isCirrus ? 'cirrus' : 'unknown')
console.log('Architecture:', arch)
console.log('OS:', os)
```

### API

#### Platform Detection

- `platform` — string: current platform ('cirrus', 'node', 'browser', etc.)
- `isCirrus` — boolean
- `isNode` — boolean
- `isBrowser` — boolean
- `isWebWorker` — boolean
- `isDeno` — boolean
- `isBun` — boolean
- `isElectron` — boolean
- `isTauri` — boolean
- `isCapacitor` — boolean

#### Architecture

- `arch` — string: current architecture ('x64', 'arm64', etc.)
- `isX64` — boolean
- `isArm64` — boolean

#### OS

- `os` — string: current OS ('mac', 'windows', 'linux', etc.)
- `isMac` — boolean
- `isWindows` — boolean
- `isLinux` — boolean

#### App Platform Target

- `appPlatformTarget` — string: application framework ('cirrus', 'web', 'node', 'electron', 'tauri', 'capacitor', etc.)

---

## @sky-modules/testing

**Testing utilities (vitest as dev dependency only).**

### Installation

```bash
pnpm add @sky-modules/testing
```

### Usage

```typescript
import { wait, waitFor, createSpy, benchmarkFunction, mockConsole } from '@sky-modules/testing'
```

### API

#### `wait(ms)`

Waits for specified milliseconds.

#### `waitFor(predicate, options?)`

Wait for predicate to become true.

#### `createSpy(name?)`

Creates a spy function.

#### `mockConsole()`

Returns mock console for testing.

#### `createDeferred()`

Creates a deferred promise for testing.

#### `flushPromises()`

Flushes all pending promises.

#### `expectToThrow(fn)`

Asserts that function throws error.

#### `createSequentialMock()`

Creates sequential mock for testing async operations.

#### `benchmarkCompare(fns)`

Compares performance of multiple functions.

#### `benchmarkFunction(fn, iterations?)`

Benchmarks a single function.

#### `measureExecutionTime(fn)`

Measures execution time of function.

#### `averageExecutionTime(fn, iterations?)`

Measures average execution time.

#### `comparePerformance(fns)`

Compares performance of multiple functions.

---

## @sky-modules/universal/design-system

**Design system with Box component and Panda CSS integration.**

### Installation

```bash
pnpm add @sky-modules/universal
```

### Usage

```typescript
import { Box, PandaBox, defaultTokens } from '@sky-modules/universal/design-system'

<Box padding="4" backgroundColor="primary.500">
  Content
</Box>

<PandaBox bg="primary.500" p="4" rounded="md">
  PandaBox
</PandaBox>
```

### API

#### Box Component

- `Box` — polymorphic container component
- `BoxOwnProps` — Box own props interface
- `BoxProps<T>` — Box props for HTML element T
- `BoxComponentProps<P>` — Box props for component P
- `TagName` — union of HTML tag names

**Example:**

```tsx
<Box padding="4" backgroundColor="primary.500">
  Content
</Box>

<Box as="button" padding="4">
  Button
</Box>
```

#### PandaBox Component

- `PandaBox` — Box with Panda CSS (Chakra UI) props
- `PandaProps` — Panda CSS props interface
- `PandaBoxProps<T>` — PandaBox props

**Example:**

```tsx
<PandaBox bg="primary.500" p="4" rounded="md" display="flex">
  Content
</PandaBox>
```

#### Design Tokens

- `DesignTokens` — complete design tokens definition
- `DesignTokensDescription` — partial tokens for extending
- `DesignTokenFoundation` — foundation tokens (colors, typography, spacing, shadows, borderRadius)
- `DesignTokenSemantic` — semantic tokens (palettes, states, references)
- `DesignTokenLayout` — layout tokens (containers, breakpoints, grid)
- `SchemesConfig` — color schemes configuration
- `ThemesConfig` — theme modes (light/dark)
- `defaultTokens` — default design tokens

**Example:**

```tsx
const tokens = {
    name: 'my-app',
    foundation: { colors: { primary: { 500: '#3b82f6' } } },
    semantic: { palettes: { primary: '#3b82f6' } },
    themes: { default: 'light' },
    schemes: { default: 'blue' }
}
```

---

## @sky-modules/universal/behavior/machines/robot3

**robot3 state machine utilities for UI components.**

### Installation

```bash
pnpm add @sky-modules/universal
```

### Usage

```typescript
import { createMachine, state, transition } from '@sky-modules/universal/behavior/machines/robot3'

const toggleMachine = createMachine({
    off: state(transition('toggle', 'on')),
    on: state(transition('toggle', 'off'))
})
```

### API

- `createMachine(config)` — creates a state machine
- `state(...)` — defines a state with sub-states
- `transition(event, target)` — defines a transition
- `invoke(...)` — invokes an effect
- `immediate(...)` — immediate transition
- `guard(condition, ...)` — guard condition
- `reduce(...)` — reduce action
- `action(...)` — action definition
- `interpret(machine)` — interprets the state machine

**Example:**

```typescript
const machine = createMachine({
    idle: state(
        transition('click', 'loading'),
        transition('cancel', 'idle')
    ),
    loading: state(
        transition('success', 'done'),
        transition('error', 'error'),
        transition('cancel', 'idle')
    ),
    done: state(),
    error: state()
})
```

---

## @sky-modules/universal/SlotRoot

**SlotRoot provider for compound components.**

### Installation

```bash
pnpm add @sky-modules/universal
```

### Usage

```typescript
import { SlotRootProvider, getSlotRoot, getSlotStyles } from '@sky-modules/universal/SlotRoot'

<SlotRootProvider styles={{ content: 'p-4' }} controller={controller}>
  <Content />
</SlotRootProvider>
```

### API

- `SlotRootProvider` — provider component for passing styles/controller to children
- `getSlotRoot()` — get SlotRoot context
- `useSlotRoot()` — hook alias for getSlotRoot
- `getSlotStyles(styles, slot)` — get styles for a specific slot
- `setContext(context, target, value)` — set context
- `useContext(target)` — get context from element
- `SlotRootContext` — context type

**Example:**

```tsx
const controller = { state: 'active' }

<SlotRootProvider styles={{ trigger: 'px-4 py-2' }} controller={controller}>
  <Trigger />
  <Content />
</SlotRootProvider>
```

---

## @sky-modules/jsx

**Universal JSX runtime based on SolidJS.**

### Installation

```bash
pnpm add @sky-modules/jsx
```

### Usage

```typescript
import { jsx, jsxs, Fragment, JSX } from '@sky-modules/jsx'

const element = jsx('div', { className: 'box', children: 'Hello' })
```

### API

#### `jsx(type, props)`

Creates a JSX element for production builds.

#### `jsxs(type, props)`

Creates a JSX element with static children.

#### `jsxDEV(type, props)`

Development version of `jsx()`.

#### `Fragment`

Fragment element type.

#### JSX namespace

TypeScript namespace for JSX type checking:
- `JSX.Element`
- `JSX.Node`
- `JSX.FC<P>`
- `JSX.IntrinsicElements`

#### Universal renderer

```typescript
import { createElement, createTextNode, render, createComponent } from '@sky-modules/jsx/jsx-universal'
```

---

## @sky-modules/vike

**Vike integration utilities.**

### Installation

```bash
pnpm add @sky-modules/vike
```

### Usage

```typescript
import { getHeadSetting, callCumulativeHooks, mergeTagAttributes, getCumulativeStrings } from '@sky-modules/vike'
```

### API

#### `getHeadSetting(pageContext, setting, defaultValue?)`

Reads a config setting, prioritizing `_configViaHook`, then cumulative arrays, then default value.

#### `callCumulativeHooks(pageContext, hookName, ...args)`

Sequentially invokes async hooks from `pageContext.config[hookName]`.

#### `mergeTagAttributes(pageContext, setting, defaults?)`

Merges cumulative attribute objects into a single HTML attribute string.

#### `getCumulativeStrings(pageContext, setting, separator?)`

Joins cumulative string settings with a separator.

---

## @sky-modules/router

**Universal client-side router based on @sky-modules/jsx.**

### Installation

```bash
pnpm add @sky-modules/router
```

### Usage

```typescript
import { UniversalRouter, createRoutesFromScreens } from '@sky-modules/router'

const routes = [
    { path: '/', Component: HomePage },
    { path: '/users/:id', Component: UserPage },
]

const router = new UniversalRouter(routes, {
    notFound: NotFoundPage,
    loading: LoadingPage,
})

router.subscribe((match) => {
    console.log('Route changed:', match)
})

router.navigate('/users/123')
```

### API

- `UniversalRouter` — router class
- `createRoutesFromScreens(screens)` — file-based routing
- `Route`, `RouteMatch`, `ScreenModule`, `PageRoute` — types

---

## @sky-modules/canvas

**2D Canvas JSX renderer based on @sky-modules/jsx.**

### Installation

```bash
pnpm add @sky-modules/canvas
```

### Usage

```typescript
import { CanvasRenderer, Scene, createCanvasObject } from '@sky-modules/canvas'

const renderer = new CanvasRenderer({
    size: () => [800, 600],
    pixelRatio: 2,
})

const scene = new Scene()
const rect = createCanvasObject({
    type: 'rect',
    props: { x: 10, y: 10, width: 100, height: 50, fill: '#ff0000' },
})

if (rect) scene.add(rect)
renderer.render(scene)
```

### API

- `CanvasRenderer` — 2D canvas renderer
- `Scene`, `Group`, `Mesh`, `Object2D` — scene graph
- `RectGeometry`, `CircleGeometry` — geometries
- `BasicMaterial`, `FillStrokeMaterial` — materials
- `createCanvasObject(element)` — JSX to canvas object

---

## @sky-modules/three

**Three.js JSX renderer based on @sky-modules/jsx.**

### Installation

```bash
pnpm add @sky-modules/three
```

### Usage

```typescript
import { ThreeJSXRenderer } from '@sky-modules/three'

const renderer = new ThreeJSXRenderer()

renderer.render({
    type: 'scene',
    props: { background: 0x111111 },
    children: [
        { type: 'ambientLight', props: { intensity: 0.5 } },
        {
            type: 'mesh',
            props: { position: [0, 0, 0] },
            children: [
                { type: 'boxGeometry', props: { args: [1, 1, 1] } },
                { type: 'meshStandardMaterial', props: { color: 0x00ff00 } },
            ],
        },
    ],
})
```

### API

- `ThreeJSXRenderer` — JSX-based Three.js renderer
- Intrinsic elements: `scene`, `camera`, `mesh`, `group`, lights, geometries, materials

---

## @sky-modules/core

**Unified entry point — re-exports all packages.**

**Note:** Core does NOT re-export `platformDetect`. Use `@sky-modules/platform` directly.

### Usage

```typescript
import { define, number, string, registerReactiveHook } from '@sky-modules/core'

registerReactiveHook()

@define('game.Player')
class Player {
    @number.min(0).max(100) health = 100
    @string.nonEmpty() name = ''
}
```

### API

Core re-exports all public APIs from:
- `@sky-modules/define`
- `@sky-modules/schema`
- `@sky-modules/reactive`
- `@sky-modules/share`
- `@sky-modules/save`
- `@sky-modules/migration`
- `@sky-modules/utilities`
- `@sky-modules/platform`
- `@sky-modules/testing`

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
@sky-modules/core       (re-exports everything)
```

```
@sky-modules/utilities  (standalone — zero dependencies)
@sky-modules/platform   (standalone — zero dependencies)
@sky-modules/testing    (standalone — only vitest as devDep)
```

---

## License

MIT
