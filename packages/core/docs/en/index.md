# @sky-modules/core

Core primitives: class traits and `compose` for typed multiple composition.

A trait is a plain class with an API like Three.js math: `constructor(...args)`, `set(...args)`, `copy(other)`, `clone()`. `compose` builds a base class whose prototype holds the methods of all traits (once) plus generated `copy` and `clone`. The user writes the constructor and `set` of the composition.

## Quick start

```ts
import { compose } from '@sky-modules/core'

class Vector2 {
    x!: number
    y!: number

    constructor(x = 0, y = 0) {
        this.set(x, y)
    }

    set(x: number, y: number): this {
        this.x = x
        this.y = y
        return this
    }

    copy(other: Vector2): this {
        this.x = other.x
        this.y = other.y
        return this
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this)
    }

    move(dx: number, dy: number): this {
        this.x += dx
        this.y += dy
        return this
    }
}

// Size is declared the same way: width, height, area()

class Rect extends compose(Vector2, Size) {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        super()
        this.set(x, y, width, height)
    }

    set(x: number, y: number, width: number, height: number): this {
        Vector2.prototype.set.call(this, x, y)
        Size.prototype.set.call(this, width, height)
        return this
    }
}

const rect = new Rect(0, 0, 10, 20)
rect.move(5, 5)
const copy = rect.clone()
```

## API

### Trait

Requirements checked by types (`CheckTrait`):

- the class is constructible without arguments: default values (`constructor(x = 0, y = 0)`, as in Three.js) or an empty overload `constructor()`;
- the class is constructible with the arguments of `set`. If `set` takes a union of tuples (`[color] | [r, g, b]`), the constructor must accept each of them;
- `copy(other): this`;
- `clone(): this`.

Conventions not checked by types:

- the constructor allocates nested state (arrays, nested vectors, callbacks) and calls `set`; `set` only assigns;
- `copy` assigns fields directly, not through `this.set`: inside a composition `this.set` belongs to the composition.

The `Trait<A, I>` type describes a trait class: `new (): I` and `new (...args: A): I`.

### `compose(...traits)`

Returns a base class constructible without arguments. Every argument is checked against the trait API.

The base constructor runs `Object.assign(this, new Trait())` for every trait, so nested state such as `Matrix4.elements` or `Box3.min`/`max` exists before the user `set` runs. This costs one temporary object per trait on each construction; `#private` fields are not transferred.

- The instance type is the merge of all trait instances without `set`, `copy`, `clone`, plus `copy(other: this): this` and `clone(): this`.
- `copy` runs `copy` of every trait in list order and returns `this`.
- `clone` returns `new this.constructor().copy(this)`.
- Trait methods, getters and setters are collected along the prototype chain (up to `Object.prototype`). `constructor`, `set`, `copy`, `clone` are not copied.
- The user writes the constructor and `set`. `set` must call `Trait.prototype.set.call(this, …)` of each trait manually.
- A composition with its own `constructor` and `set` is itself a trait and can be passed to another `compose`.

Rules:

- The same trait passed twice is applied once.
- Two traits with a same-named member implemented differently throw at runtime: `compose: member "move" is defined by both "A" and "B"`.
- The same field or method key with different types is rejected at compile time (`ShapeConflict`).

Limitation: `this` in trait methods is fixed to the trait class after merging. For example, `move()` on `Rect` returns `Vector2`.

### Exported types

`Trait`, `TraitInstance`, `TraitApiKey`, `AnyTraitClass`, `CheckTrait`, `ComposedApi`, `ComposedClass`, `ComposedInstance`, `MergeShapes`, `ShapeConflict`.
