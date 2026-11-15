# @sky-modules/reactive

Тонкая реактивность для классов со схемой. Подключение пакета регистрирует хук дескрипторов свойств в `@sky-modules/define`, поэтому декораторы из `@sky-modules/schema` создают свойства на сигналах SolidJS. Добавляет цепочки валидации, отслеживание изменений (`SignalLamp`) и реактивные массивы.

## Быстрый старт

```ts
import { number, string, SignalLamp } from '@sky-modules/reactive'

class Player {
    @number.min(0).max(100) health = 100
    @string.nonEmpty() name = ''
    lamp = new SignalLamp(this)
}

const player = new Player()
player.lamp.onSync((delta) => console.log(delta))
player.health = 50 // после микротаска: { health: 50 }
```

`registerReactiveHook()` экспортируется для явной регистрации. Загрузка декораторов уже вызывает её один раз.

## Декораторы

Тот же набор, что в `@sky-modules/schema`, но с цепочками валидации:

`number`, `string`, `boolean`, `bigint`, `symbol`, `date`, `array`, `object`, `map`, `set`, обёртки `optional`, `nullable`, `nullish` и модификаторы синхронизации `read`, `write`, `secret`.

### Цепочки валидации

| Декоратор | Методы |
| --- | --- |
| `string` | `min(n)`, `max(n)` (длина), `pattern(regex)`, `email()`, `url()`, `uuid()`, `nonEmpty()`, `refine(fn, message)`, `use(name)` |
| `number` | `min(n)`, `max(n)`, `integer()`, `positive()`, `negative()`, `nonNegative()`, `finite()`, `refine(fn, message)`, `use(name)` |
| `array(type)` | `minLength(n)`, `maxLength(n)`, `nonEmpty()`, `unique()`, `refine(fn, message)`, `use(name)` |
| `object(schema)` | `required()`, `refine(fn, message)`, `use(name)` |

Каждый метод принимает необязательное сообщение последним аргументом (для `refine` оно обязательно). Правила хранятся вместе со схемой и **не** запускаются при присваивании. Запускайте их через `validate`:

```ts
import { validate } from '@sky-modules/reactive'

const result = validate(player)
// { valid: boolean, errors: [{ path, message, rule }] }
```

Правила `refine` и `use` пропускают значения `null` и `undefined`.

### Собственные валидаторы

```ts
import { extendString, number, string } from '@sky-modules/reactive'

extendString('noSpaces', (value) => !value.includes(' '), 'Spaces are not allowed')

class Account {
    @string.use('noSpaces') login = ''
}
```

`extendNumber`, `extendArray`, `extendObject` и `extendFunc` работают так же. Неизвестное имя выбрасывает `String extension 'x' not found` (или аналог для другого типа).

## SignalLamp

Изолированная единица синхронизации, поле вашего объекта (композиция, а не наследование).

| Член | Назначение |
| --- | --- |
| `new SignalLamp(target)` | Начинает наблюдать за реактивными свойствами `target`. |
| `onSync(callback)` | Подписка на дельты (плоские `{ key: value }`). Возвращает функцию отписки. |
| `getSnapshot()` | Простой объект с текущими значениями, включая геттеры прототипа. |
| `committed()` | Промис, который выполняется после доставки накопленных дельт. |
| `target` | Наблюдаемый объект. |

Изменения в одном тике собираются в один колбэк через микротаск. Именно это использует `@sky-modules/share` для отправки дельт.

## signal

`signal(initial)` возвращает прокси, где каждое свойство — сигнал SolidJS. `getRawValue(proxy)` возвращает сырые данные, `isSignal(value)` проверяет, что значение — такой прокси.

## reactiveArray

```ts
import { reactiveArray } from '@sky-modules/reactive'

const items = reactiveArray([1, 2, 3], (event, array) => {
    console.log(event)
})
items.push(4) // { type: 'push', items: [4] }
```

Изменяющие методы: `push`, `pop`, `shift`, `unshift`, `splice`, `set(index, value)`, `clear()`. Чтение: `length`, индексация, итераторы, `includes`, `indexOf`, `toArray()`. События изменений:

| `type` | Поля |
| --- | --- |
| `push`, `unshift` | `items` |
| `pop`, `shift` | `item` |
| `splice` | `start`, `deleteCount`, `items` |
| `set` | `index`, `value` |
| `clear` | нет |

`isReactiveArray(value)` и `getInternalArray(arr)` доступны из `@sky-modules/reactive/lamps`.

## Простые реактивные объекты

Подпуть `@sky-modules/reactive/define` экспортирует `define`. `makePlain(schema)` возвращает конструктор, создающий простые реактивные объекты из объекта-схемы, `createPlain(schema, initial?)` — сокращение, `isPlain(obj)` и `getPlainSchema(obj)` их проверяют.

## Типы

`ExtractSchemaType`, `Schema`, `Shared`, `TypeWithModifier`, `ValidationResult`, `FieldError`, `ValidationRule`, `ValidatorFn`, `SyncCallback`, `ReactiveArray`, `ArrayChangeEvent`, `ArrayChangeCallback`.

## Playground

<Playground name="reactive" />
