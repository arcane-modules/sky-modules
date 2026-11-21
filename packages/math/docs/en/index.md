# @sky-modules/math

three.js 0.187.0 math (`src/math`) copied unchanged, with typings from `@types/three` 0.187.0. No dependency on `three`.

## Quick start

```ts
import { Matrix4, Quaternion, Vector3 } from '@sky-modules/math'

const position = new Vector3(1, 2, 3)
const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
const matrix = new Matrix4().compose(position, rotation, new Vector3(1, 1, 1))
```

## As traits

Value classes pass the `@sky-modules/core` trait check:

```ts
import { compose } from '@sky-modules/core'
import { Box3, Vector3 } from '@sky-modules/math'

class Label {
    text: string

    constructor(text = '') {
        this.text = text
    }

    set(text: string): this {
        this.text = text
        return this
    }

    copy(other: Label): this {
        this.text = other.text
        return this
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this)
    }
}

class LabeledBox extends compose(Box3, Label) {
    set(min: Vector3, max: Vector3, text: string): this {
        Box3.prototype.set.call(this, min, max)
        Label.prototype.set.call(this, text)
        return this
    }
}
```

Not traits: `Matrix2` (three.js 0.187.0 defines no `copy`/`clone` for it), `FrustumArray`, `Interpolant` and interpolants, `MathUtils`, `ColorManagement`.

three.js classes share many methods (`equals`, `fromArray`, `toArray`), so two three.js classes in one `compose` conflict. The usual case is one three.js class plus your own traits.

## External types

`Object3D`, `BufferAttribute`, `InterleavedBufferAttribute`, `Camera`, `ArrayCamera`, `Sprite` are structural stubs in `src/three/core`, `cameras`, `objects`, containing only the members read by the math code. Their compatibility with the typings of the `three` package is not verified.

## License

three.js and `@types/three` code is MIT licensed; see `LICENSE-three.md`.
