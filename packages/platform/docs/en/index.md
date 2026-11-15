# @sky-modules/platform

Runtime environment detection. Every value is computed once when the module loads, so it is a plain constant.

```ts
import { isBrowser, os, platform, runsOnServerSide } from '@sky-modules/platform'

if (runsOnServerSide) {
    // server-only code
}
```

## Platform

`platform` is one of `'cirrus' | 'node' | 'browser' | 'worker' | 'deno' | 'bun' | 'electron' | 'tauri' | 'capacitor' | 'unknown'`.

Detection order, the first match wins: Cirrus (`globalThis.__CIRRUS__`), Deno, Bun, Electron, Node.js, Tauri, Capacitor, browser (`window`), web worker (`self`).

Boolean shortcuts: `isCirrus`, `isNode` (not Electron), `isBrowser` (not Tauri or Capacitor), `isWebWorker`, `isDeno`, `isBun`, `isElectron`, `isTauri`, `isCapacitor`.

## Side

| Constant | Value |
| --- | --- |
| `runsOnSide` | `'server'` when `window` is undefined, otherwise `'client'`. |
| `runsOnServerSide` | `true` on the server. |
| `runsOnClientSide` | `true` in a browser or webview. |

## Operating system

`os` is `'mac' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown'`. It uses `process.platform` when available, then Capacitor, then the user agent. Shortcuts: `isMac`, `isWindows`, `isLinux`, `isAndroid`, `isIOS`.

## CPU architecture

`arch` is `'x64' | 'arm64' | 'ia32' | 'wasm32' | 'unknown'`. It uses `process.arch`, otherwise the user agent and `navigator.platform`. Shortcuts: `isX64`, `isArm64`.

## Application target

`appPlatformTarget` identifies the app framework: `'cirrus' | 'web' | 'node' | 'electron' | 'tauri' | 'capacitor' | 'react-native' | 'unknown'`. Unlike `platform`, it separates React Native and reports a plain browser as `'web'`.

## Types

`Platform`, `OS`, `Arch`, `AppPlatformTarget`.
