# @sky-modules/core

Базовые примитивы: трейты без состояния и `compose` для типизированной множественной композиции.

Трейт — обычный объект с методами и необязательным `init`. `compose` строит класс, в прототипе которого лежат методы всех трейтов (по одному разу), а конструктор вызывает `init` каждого трейта на одном и том же экземпляре.

## Быстрый старт

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

Объявляет трейт. Значение во время выполнения — сам объект определения.

| Параметр типа | Значение |
| --- | --- |
| `N` | Имя трейта, строковый литерал. Должно быть уникальным в рамках одного вызова `compose`. |
| `F` | Поля, которые трейт записывает в экземпляр (обычно в `init`). |
| `M` | Методы, которые вносит трейт. |
| `A` | Кортеж аргументов `init`. По умолчанию `[]`. |

Внутри методов и `init` тип `this` — `F & M`.

Имена `name` и `init` зарезервированы и не копируются в прототип.

### `compose(...traits)`

Возвращает конструктор класса. Тип экземпляра — объединение полей и методов всех трейтов.

Конструктор принимает один необязательный объект, где ключ — имя трейта, а значение — кортеж аргументов его `init`:

```ts
new Player({ Position: [10, 20] })
```

Аргумент становится обязательным, как только у какого-либо трейта `A` не пуст.

Правила:

- Один и тот же трейт, переданный дважды, применяется один раз.
- Два **разных** трейта с одинаковым именем выбрасывают ошибку во время выполнения: `compose: two different traits share the name "X"`.
- Два трейта с одним и тем же методом, но разными реализациями выбрасывают ошибку: `compose: method "run" is defined by both "A" and "B"`.
- Один и тот же ключ поля или метода с разными типами отклоняется на этапе компиляции (`ShapeConflict`).

### Экспортируемые типы

`Trait`, `TraitDefinition`, `TraitTypes`, `ComposedClass`, `ComposedInstance`, `ComposeArgs`, `MergeShapes`, `ShapeConflict`.
