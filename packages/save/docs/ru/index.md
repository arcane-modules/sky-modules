# @sky-modules/save

Сохранение классов со схемой: `save` превращает значение в JSON-строку, `load` восстанавливает по ней экземпляры классов.

В отличие от `@sky-modules/share`, `save` записывает **все** поля, включая `@secret`. Модификаторы влияют только на сетевую синхронизацию.

## Быстрый старт

```ts
import define from '@sky-modules/define'
import { number, string } from '@sky-modules/schema'
import { load, save } from '@sky-modules/save'

@define('app.User')
class User {
    @string name = 'Anna'
    @number age = 25

    greet() {
        return `Hello ${this.name}`
    }
}

const json = save(new User())
// {"class":"app.User","id":1,"version":null,"data":{"name":"Anna","age":25}}

const restored = load<User>(json)
restored instanceof User // true
restored.greet() // "Hello Anna"
```

## Формат

Объект, зарегистрированный через `define`, превращается в:

```ts
interface SerializedData {
    class: string // имя из define, например 'app.User'
    id: number // id экземпляра
    version: string | null // версия миграции; сейчас save всегда пишет null
    data: Record<string, unknown>
}
```

Остальные значения:

- Простые объекты и массивы сериализуются рекурсивно.
- `Map`, `Set`, `Date` и `RegExp` записываются как `{ "__type": "Map" | "Set" | "Date" | "RegExp", ... }` и восстанавливаются в те же типы.
- Сначала читаются поля схемы, затем собственные свойства, которых в схеме нет.

## API

### `save(value, options?)`

Возвращает JSON-строку.

### `load<T>(json, options?)`

Разбирает строку и пересобирает экземпляры. Для каждой записи `{ class, data }`:

1. Имя класса разрешается через алиасы из `@sky-modules/migration`.
2. Если сохранённая версия отличается от текущей, применяются миграции.
3. Из реестра `define` создаётся экземпляр. Свойства с сеттерами (реактивные) присваиваются через сеттер, остальные определяются напрямую.
4. Восстанавливается сохранённый `id`.

Неизвестный класс выбрасывает `Unknown class: ...` с подсказкой зарегистрировать его через `@define` до вызова `load`.

### Низкий уровень

`serializeWithMetadata(value)` возвращает сериализуемый объект, `deserializeWithMetadata(parsed)` восстанавливает значения из разобранного объекта. Типы: `SerializedData`, `SerializedSpecialType`, `SaveOptions`, `LoadOptions`.

`SaveOptions` и `LoadOptions` принимают `unsafe` — зарезервированный параметр: текущая реализация не проверяет схему.
