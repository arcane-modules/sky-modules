# @sky-modules/core

Базовые примитивы: трейты-классы и `compose` для типизированной множественной композиции.

Трейт — обычный класс с API как у математики Three.js: `constructor(...args)`, `set(...args)`, `copy(other)`, `clone()`. `compose` строит базовый класс, в прототипе которого лежат методы всех трейтов (по одному разу), а также сгенерированные `copy` и `clone`. Конструктор и `set` композиции пишет пользователь.

## Быстрый старт

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

### Трейт

Требования, которые проверяются в типах (`CheckTrait`):

- класс создаётся без аргументов: значения по умолчанию (`constructor(x = 0, y = 0)`, как в Three.js) или пустая перегрузка `constructor()`;
- класс создаётся с аргументами `set`. Если `set` принимает объединение кортежей (`[color] | [r, g, b]`), конструктор должен принимать каждый из них;
- `copy(other): this`;
- `clone(): this`.

Соглашения, которые типами не проверяются:

- конструктор выделяет вложенное состояние (массивы, вложенные векторы, колбэки) и вызывает `set`; `set` только присваивает;
- `copy` присваивает поля напрямую, а не через `this.set`: внутри композиции `this.set` принадлежит композиции.

Тип `Trait<A, I>` описывает класс трейта: `new (): I` и `new (...args: A): I`.

### `compose(...traits)`

Возвращает базовый класс, который создаётся без аргументов. Каждый аргумент проверяется на API трейта.

Базовый конструктор для каждого трейта выполняет `Object.assign(this, new Trait())`. Поэтому вложенное состояние, например `Matrix4.elements` или `Box3.min`/`max`, уже существует, когда вызывается `set` пользователя. Цена — один временный объект на трейт при каждом создании. Поля `#private` так не переносятся.

- Тип экземпляра — объединение экземпляров трейтов без `set`, `copy`, `clone`, плюс `copy(other: this): this` и `clone(): this`.
- `copy` вызывает `copy` каждого трейта в порядке списка и возвращает `this`.
- `clone` возвращает `new this.constructor().copy(this)`.
- Методы, геттеры и сеттеры трейта собираются по цепочке прототипов (до `Object.prototype`). `constructor`, `set`, `copy`, `clone` не переносятся.
- Конструктор и `set` пишет пользователь. В `set` нужно вручную вызвать `Trait.prototype.set.call(this, …)` каждого трейта.
- Композиция с собственными `constructor` и `set` сама является трейтом и может передаваться в другой `compose`.

Правила:

- Один и тот же трейт, переданный дважды, применяется один раз.
- Если у двух трейтов член с одним именем реализован по-разному, во время выполнения будет ошибка `compose: member "move" is defined by both "A" and "B"`.
- Если у двух трейтов поле или метод с одним именем имеет разные типы, `compose` отклоняется на этапе компиляции (`ShapeConflict`).

Ограничение: тип `this` в методах трейта после объединения фиксируется на классе трейта. Например, `move()` у `Rect` возвращает `Vector2`.

### Экспортируемые типы

`Trait`, `TraitInstance`, `TraitApiKey`, `AnyTraitClass`, `CheckTrait`, `ComposedApi`, `ComposedClass`, `ComposedInstance`, `MergeShapes`, `ShapeConflict`.
