# @sky-modules/math

Математика three.js 0.187.0 (`src/math`), скопированная без изменений, с типами из `@types/three` 0.187.0. Зависимость от `three` не нужна.

## Быстрый старт

```ts
import { Matrix4, Quaternion, Vector3 } from '@sky-modules/math'

const position = new Vector3(1, 2, 3)
const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
const matrix = new Matrix4().compose(position, rotation, new Vector3(1, 1, 1))
```

## Как трейты

Классы-значения проходят проверку трейта `@sky-modules/core`:

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

Трейтами не являются: `Matrix2` (в three.js 0.187.0 у него нет `copy`/`clone`), `FrustumArray`, `Interpolant` и интерполянты, `MathUtils`, `ColorManagement`.

У классов three.js много общих методов (`equals`, `fromArray`, `toArray`), поэтому два класса three.js в одном `compose` конфликтуют. Обычный сценарий — один класс three.js плюс свои трейты.

## Внешние типы

`Object3D`, `BufferAttribute`, `InterleavedBufferAttribute`, `Camera`, `ArrayCamera`, `Sprite` — структурные заглушки в `src/three/core`, `cameras`, `objects`. В них только те члены, которые читает код math. Совместимость этих заглушек с типами из пакета `three` не проверялась.

## Лицензия

Код three.js и `@types/three` распространяется под MIT. Тексты лицензий лежат в `LICENSE-three.md`.
