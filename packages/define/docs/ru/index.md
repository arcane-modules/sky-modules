# @sky-modules/define

Регистратор классов, функций и объектов со стабильными именами и числовыми идентификаторами.

## Быстрый старт

```ts
import define from '@sky-modules/define'

// Как декоратор класса
@define('app.MyService')
class MyService {}

// Как функция: регистрирует и возвращает значение
const helper = define('app.utils.helper', function helper() {
    return 'help'
})

// Объекты и массивы тоже регистрируются
define('app.config', { apiUrl: 'https://api.example.com' })
```

## Правила

- Имя должно соответствовать `/^[a-zA-Z][a-zA-Z0-9_.]*$/`.
- Последний сегмент имени через точку становится коротким именем.
- Классы получают числовой id. Если id был загружен ранее через `loadedDefines`, он стабилен, иначе берётся из `nextUniqueId()`.
- Повторное определение того же имени после `startRuntime()` выбрасывает `DuplicateDefineError`. Любой `define` после запуска выбрасывает `RuntimeDefineError`, кроме горячей перезагрузки.

## Жизненный цикл рантайма

```ts
import { runBeforeRuntime, startRuntime } from '@sky-modules/define'

runBeforeRuntime(() => {
    // отложенная регистрация, помогает избежать циклических импортов
})

await startRuntime() // выполняет отложенные колбэки, затем переключает в режим рантайма
```

`runBeforeRuntime(cb)` выполняет `cb` сразу в режиме рантайма, иначе ставит в очередь. `setRuntime` и `setHot` переключают режимы вручную.

## Горячая перезагрузка

Зарегистрируйте обработчики, чтобы узнавать о повторном определении имени при `isHot()`:

```ts
import { registerHotClassHandler, registerHotValueHandler } from '@sky-modules/define'

registerHotValueHandler((name, oldValue, newValue) => {})
registerHotClassHandler((name, oldClass, newClass) => {})
```

## Ошибки

| Класс | Когда |
| --- | --- |
| `DefineError` | Базовый класс всех ошибок ниже. |
| `InvalidDefineNameError` | Имя не соответствует шаблону или значение не объект и не функция. |
| `DuplicateDefineError` | Имя уже определено в рантайме. |
| `RuntimeDefineError` | Определение в рантайме вне горячей перезагрузки. |
| `RecursiveDefineError` | `define` вызывает сам себя (напрямую или через импорты). В сообщении виден стек. |

## Реестр и состояние

`defines` хранит все зарегистрированные значения. `loadedDefines` сопоставляет имена с id, загруженными из файла схемы. Помощники: `getUniqueId`, `setUniqueId`, `nextUniqueId`, `getSchemaLoaded`, `setSchemaLoaded`.

Метаданные хранятся в символах: `idSymbol`, `typeSymbol` (`class`, `func`, `object`, `array`), `nameSymbol`, `uidSymbol`, а также `schemaSymbol` и другие, которые использует `@sky-modules/schema`.

## Хуки дескрипторов свойств

`createPropertyDescriptor` и `createPropertyDescriptorMap` по умолчанию строят простые дескрипторы с геттером и сеттером. Другие пакеты (например, `reactive`) подменяют их через `registerPropertyDescriptorHook` и `registerPropertyDescriptorMapHook`, поэтому `define` не зависит от реактивных библиотек.

## Типы

`Modifier` (`read`, `write`, `secret`), `PropertyMeta`, `Static`, `Shared`, `Defines`, `UpdateOfSharedCallback`, `ListenersStorage`.
