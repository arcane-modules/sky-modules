# @sky-modules/vike

Helpers for reading Vike settings from `pageContext`. `vike` (^0.4) is a peer dependency.

```ts
import { callCumulativeHooks, getCumulativeStrings, getHeadSetting, mergeTagAttributes } from '@sky-modules/vike'
```

The helpers are also available from `@sky-modules/vike/helpers`.

## `getHeadSetting(pageContext, setting, defaultValue?)`

Reads one value. Priority: `pageContext._configViaHook[setting]` (when not `null` or `undefined`), then `pageContext.config[setting]`, then `defaultValue`. When the config value is an array, the last item that is not `undefined`, `null` or `''` wins.

```ts
const title = getHeadSetting<string>(pageContext, 'title', 'Untitled')
```

## `getCumulativeStrings(pageContext, setting, separator = '\n')`

Joins an array setting. Non-string items are skipped. Returns `''` when the setting is not an array.

## `mergeTagAttributes(pageContext, setting, defaults?)`

Merges the cumulative `htmlAttributes` or `bodyAttributes` objects into one attribute string. Later objects override earlier ones and `defaults`. An empty value produces a bare attribute and double quotes are escaped.

```ts
mergeTagAttributes(pageContext, 'htmlAttributes', { lang: 'en' })
// 'lang="en" class="dark"'
```

## `callCumulativeHooks(pageContext, hookName, ...args)`

Awaits every function in `pageContext.config[hookName]` in order with the given arguments. Returns the last result that is not `undefined`, or `undefined` when there are no hooks.
