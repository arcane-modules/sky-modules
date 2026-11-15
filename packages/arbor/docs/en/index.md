# Arbor

**Ownership, lifecycle, context and event dispatch tree runtime.**

Arbor is a hierarchical runtime for managing resource ownership, controlled destruction, scoped dependency injection (contexts), and event propagation through a tree structure. Inspired by Rust's ownership model.

## Installation

```bash
npm install @sky-modules/arbor
```

## Quick Start

```typescript
import { ArborTree, ArborNode, invoke } from '@sky-modules/arbor'

// Create root
const tree = new ArborTree()

// Node with cleanup
const node = new ArborNode(() => {
    const timer = setInterval(() => console.log('tick'), 1000)
    return () => clearInterval(timer)
}, tree)

// Commit pending operations
tree.commit()

// Dispose — children cleaned first, then node
await node.dispose()
```

## Core Concepts

### ArborTree (root)
- Only node that can exist without a parent
- Manages operation queues (parents, dependencies, contexts)
- Provides IO hooks: update, render, mouse, keyboard, gamepad, window resize
- `commit()` processes all pending structural changes atomically

### ArborNode (node)
- Owned resource with optional setup/destructor
- Multi-parent support (shared ownership)
- Last parent removal triggers automatic disposal
- Children disposed first, then parent (post-order)

### Contexts
- Classes with `static context = true`
- `addContext(ctx)` on any node, propagates downward
- `context(Context)` / `maybeContext(Context)` / `hasContext(Context)`
- Context hooks: `onXxxContext(ctx)` on host returns optional destructor

### @invoke Hooks (Minecraft-style)

Attach hooks directly to class methods. They auto-register when the class is used as a host and clean up on dispose.

```typescript
class PlayerSystem {
    node: ArborNode

    constructor(tree: ArborTree) {
        this.node = new ArborNode(tree, this)
    }

    @invoke('update')
    onUpdate(dt: number) {
        // called every frame via registerUpdateEvents()
    }

    @invoke('render')
    onRender() {
        // called every render frame
    }

    @invoke('resize')
    onResize({ width, height }: { width: number; height: number }) {
        // called on window resize
    }
}
```

```typescript
tree.registerUpdateEvents()
tree.registerRenderEvents()
tree.registerEmitWindowResize({ resize: () => {} })
```

### Events
- `dispatch(name, event)` — top-down propagation
- `dispatchReverse(name, event)` — self first, then children in reverse
- `isCaptured` flag support

## API

```typescript
class ArborTree extends ArborBase {
    commit(): void
    registerUpdateEvents(opts?): this
    registerMouseEvents(opts?): this
    registerEmitKeyboardEvents(before?, after?): this
    registerGamepadEvents(opts?): this
    registerRenderEvents(opts?): this
    registerEmitWindowResize(opts?): this
    stopGamepadPolling(): void
}

class ArborNode extends ArborBase {
    constructor(dep: ArborDependency, host?: object)
    constructor(setup: () => Destructor | void, dep: ArborDependency, host?: object)

    addParent(parent: ArborBase): this
    removeParent(parent: ArborBase): this
    addDep(dep: ArborDependency): this
    removeDep(dep: ArborDependency): this
    isChildOf(parent: ArborBase): boolean
}

class ArborBase {
    readonly id: number
    readonly host?: object
    readonly disposed: boolean

    addContext(ctx: object): this
    removeContext(ctx: object): this
    context<T>(Context: T): InstanceType<T>
    maybeContext<T>(Context: T): InstanceType<T> | undefined
    hasContext(Context: ArborContextClass): boolean

    dispatch(name: string, event: ArborEvent): this
    dispatchReverse(name: string, event: ArborEvent): this

    dispose(): Promise<void>
}
```

## License

MIT

## Playground

<Playground name="arbor" />
