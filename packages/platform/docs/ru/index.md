# @sky-modules/platform

Определение среды выполнения. Каждое значение вычисляется один раз при загрузке модуля, поэтому это обычная константа.

```ts
import { isBrowser, os, platform, runsOnServerSide } from '@sky-modules/platform'

if (runsOnServerSide) {
    // код только для сервера
}
```

## Платформа

`platform` — одно из `'cirrus' | 'node' | 'browser' | 'worker' | 'deno' | 'bun' | 'electron' | 'tauri' | 'capacitor' | 'unknown'`.

Порядок определения, первое совпадение побеждает: Cirrus (`globalThis.__CIRRUS__`), Deno, Bun, Electron, Node.js, Tauri, Capacitor, браузер (`window`), веб-воркер (`self`).

Булевы сокращения: `isCirrus`, `isNode` (не Electron), `isBrowser` (не Tauri и не Capacitor), `isWebWorker`, `isDeno`, `isBun`, `isElectron`, `isTauri`, `isCapacitor`.

## Сторона

| Константа | Значение |
| --- | --- |
| `runsOnSide` | `'server'`, если `window` не определён, иначе `'client'`. |
| `runsOnServerSide` | `true` на сервере. |
| `runsOnClientSide` | `true` в браузере или веб-вью. |

## Операционная система

`os` — `'mac' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown'`. Используется `process.platform`, если он есть, затем Capacitor, затем user agent. Сокращения: `isMac`, `isWindows`, `isLinux`, `isAndroid`, `isIOS`.

## Архитектура процессора

`arch` — `'x64' | 'arm64' | 'ia32' | 'wasm32' | 'unknown'`. Используется `process.arch`, иначе user agent и `navigator.platform`. Сокращения: `isX64`, `isArm64`.

## Целевая платформа приложения

`appPlatformTarget` определяет фреймворк приложения: `'cirrus' | 'web' | 'node' | 'electron' | 'tauri' | 'capacitor' | 'react-native' | 'unknown'`. В отличие от `platform`, отличает React Native, а обычный браузер называет `'web'`.

## Типы

`Platform`, `OS`, `Arch`, `AppPlatformTarget`.
