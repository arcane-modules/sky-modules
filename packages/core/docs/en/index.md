# @sky-modules/core

Core primitives: stateless traits and `compose` for typed multiple composition.

A trait is a plain object with methods and an optional `init`. `compose` builds a class whose prototype holds the methods of all traits (once) and whose constructor runs every trait's `init` on the same instance.

## Quick start

```ts
import { compose, defineTrait } from '@sky-modules/core'

interface PositionFields {
    x: number
    y: number
}

const Position = defineTrait<'Position', PositionFields, object, [x: number, y: number]>({
    name: 'Position',
    init(x, y) {
        this.x = x
        this.y = y
    },
})

const Movable = defineTrait<'Movable', PositionFields, { move(dx: number, dy: number): void }, []>({
    name: 'Movable',
    move(dx, dy) {
        this.x += dx
        this.y += dy
    },
})

class Player extends compose(Position, Movable) {}

const player = new Player({ Position: [10, 20] })
player.move(5, 5)
```

## API

### `defineTrait<N, F, M, A>(definition)`

Declares a trait. The runtime value is the definition object itself.

| Type parameter | Meaning |
| --- | --- |
| `N` | Trait name, a string literal. Must be unique inside one `compose` call. |
| `F` | Fields the trait writes on the instance (usually in `init`). |
| `M` | Methods the trait contributes. |
| `A` | Tuple of `init` arguments. Defaults to `[]`. |

Inside methods and `init`, `this` is typed as `F & M`.

The names `name` and `init` are reserved and never copied to the prototype.

### `compose(...traits)`

Returns a class constructor. The instance type is the merge of all trait fields and methods.

The constructor takes one optional object that maps a trait name to the tuple of its `init` arguments:

```ts
new Player({ Position: [10, 20] })
```

The argument is required as soon as one trait declares non-empty `A`.

Rules:

- The same trait passed twice is applied once.
- Two **different** traits with the same name throw at runtime: `compose: two different traits share the name "X"`.
- Two traits defining the same method with different implementations throw at runtime: `compose: method "run" is defined by both "A" and "B"`.
- The same field or method key with different types is rejected at compile time (`ShapeConflict`).

### Exported types

`Trait`, `TraitDefinition`, `TraitTypes`, `ComposedClass`, `ComposedInstance`, `ComposeArgs`, `MergeShapes`, `ShapeConflict`.
