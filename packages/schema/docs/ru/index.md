# @sky-modules/schema

Декораторы свойств, которые описывают структуру класса. Они опираются на `createPropertyDescriptor` из `@sky-modules/define`, поэтому `@sky-modules/reactive` может сделать каждое свойство реактивным без изменений в ваших классах.

## Быстрый старт

```ts
import define from '@sky-modules/define'
import { array, number, string } from '@sky-modules/schema'

@define('game.Player')
class Player {
    @number x = 0
    @number y = 0
    @string name = ''
    @array(string) tags: string[] = []
}
```

## Декораторы типов

| Декоратор | Тип свойства |
| --- | --- |
| `@boolean`, `@number`, `@string`, `@bigint`, `@symbol` | примитивы |
| `@date` | `Date` (внутри хранится как строка) |
| `@array(type)` | массив из `type`, например `@array(number)` |
| `@object(ClassOrSchema)` | вложенный класс или объект-схема |
| `@map(keyType, valueType)` | `Map` |
| `@set(valueType)` | `Set` |

## Обёртки для необязательных значений

`optional(schema)`, `nullable(schema)` и `nullish(schema)` расширяют тип значением `undefined`, `null` или обоими.

## Модификаторы синхронизации

Модификаторы определяют, что `@sky-modules/share` отправляет по сети.

| Модификатор | Значение |
| --- | --- |
| `read` | сервер → клиент. По умолчанию. |
| `write` | в обе стороны. |
| `secret` | исключается из синхронизации. |

Используйте их как обёртки или как сокращения для примитивов:

```ts
class Account {
    @write.string nickname = ''
    @secret.string password = ''
}
```

Сокращения есть для `boolean`, `number`, `string`, `bigint`, `symbol` и `date`. `unwrapType(schema)` возвращает `{ type, modifier }`. Модификаторы влияют только на сетевую синхронизацию: `@sky-modules/save` сохраняет все поля, включая секретные.

## Простые объекты

| Функция | Результат |
| --- | --- |
| `makePlain(Class, initial?)` | Простой объект с полями схемы нового экземпляра. `initial` переопределяет только ключи, которые есть в схеме. |
| `createPlain(schema)` | Объект с ключами схемы, все значения `undefined`. |
| `hasSchema(target)` | Есть ли схема у прототипа. |
| `getSchemaKeys(target)` | Массив ключей схемы, пустой, если схемы нет. |

```ts
const player = makePlain(Player, { x: 10 })
// { x: 10, y: 0, name: '', tags: [] }
```

## Типы

`Plain<T>` извлекает тип простого объекта из класса со схемой. Также экспортируются: `Class`, `Schema`, `ExtractSchemaType`, `objectOf`, `TypeWithModifier`, `Modifier`.
