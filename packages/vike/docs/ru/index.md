# @sky-modules/vike

Помощники для чтения настроек Vike из `pageContext`. `vike` (^0.4) — peer-зависимость.

```ts
import { callCumulativeHooks, getCumulativeStrings, getHeadSetting, mergeTagAttributes } from '@sky-modules/vike'
```

Помощники также доступны из `@sky-modules/vike/helpers`.

## `getHeadSetting(pageContext, setting, defaultValue?)`

Читает одно значение. Приоритет: `pageContext._configViaHook[setting]` (если не `null` и не `undefined`), затем `pageContext.config[setting]`, затем `defaultValue`. Если значение в конфиге — массив, побеждает последний элемент, который не `undefined`, не `null` и не `''`.

```ts
const title = getHeadSetting<string>(pageContext, 'title', 'Untitled')
```

## `getCumulativeStrings(pageContext, setting, separator = '\n')`

Склеивает массив настроек. Не строковые элементы пропускаются. Возвращает `''`, если настройка не массив.

## `mergeTagAttributes(pageContext, setting, defaults?)`

Объединяет накопительные объекты `htmlAttributes` или `bodyAttributes` в одну строку атрибутов. Более поздние объекты переопределяют более ранние и `defaults`. Пустое значение даёт атрибут без значения, двойные кавычки экранируются.

```ts
mergeTagAttributes(pageContext, 'htmlAttributes', { lang: 'en' })
// 'lang="en" class="dark"'
```

## `callCumulativeHooks(pageContext, hookName, ...args)`

По порядку вызывает с переданными аргументами и дожидается каждой функции из `pageContext.config[hookName]`. Возвращает последний результат, не равный `undefined`, или `undefined`, если хуков нет.
