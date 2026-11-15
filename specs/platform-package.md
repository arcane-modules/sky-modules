# Пакет `@sky-modules/platform`

## Контекст
**Cirrus** — Rust runtime с универсальным API, который является целевой платформой для Sky Modules. Cirrus предоставляет встроенный TypeScript runtime с полным набором Platform API из коробки.

Однако пакет `@sky-modules/platform` сохраняет совместимость со всеми существующими средами (Node.js, Browser, Deno, Bun, Web Workers, Electron, **Tauri**, **Capacitor**). Детекты legacy-платформ нужны для:
- Переходного периода при миграции на Cirrus
- Обратной совместимости библиотек
- Unit-тестирования в Node.js

## Цель
Создать пакет `@sky-modules/platform` с:
1. **Primary**: определение Cirrus как родной платформы
2. **Legacy**: определение всех существующих сред выполнения (включая Tauri, Capacitor)
3. Минималистичное API — каждый модуль отдельным файлом

## Принципы
- **Zero dependencies**
- **Standalone** — не зависит от других пакетов
- **Native API** — `globalThis`, `navigator`, `process`, `window.__TAURI__`, `window.Capacitor`
- **Tree-shakeable**
- **Cirrus-first** — сначала проверка на Cirrus, потом fallback на legacy

## Состав

### 1. `runsOnSide` — сервер/клиент
```typescript
import { runsOnServerSide, runsOnClientSide } from '@sky-modules/platform'

if (runsOnServerSide) {
    // Server-only code
}
if (runsOnClientSide) {
    // Client-only code
}
```

- `runsOnSide: 'server' | 'client'` — `typeof window === 'undefined'`
- `runsOnServerSide: boolean`
- `runsOnClientSide: boolean`

### 2. Platform detection — среда выполнения
```typescript
import {
    platform,
    isCirrus, isNode, isBrowser, isWebWorker,
    isDeno, isBun, isElectron, isTauri, isCapacitor,
} from '@sky-modules/platform'
```

Проверка в порядке приоритета:
1. **Cirrus** — `typeof globalThis.__CIRRUS__ !== 'undefined'`
2. **Deno** — `typeof Deno !== 'undefined' && Deno.exit !== undefined`
3. **Bun** — `typeof Bun !== 'undefined'`
4. **Node.js** — `typeof process?.versions?.node === 'string'`
5. **Electron** — `typeof process?.versions?.electron === 'string'`
6. **Tauri** — `typeof window?.__TAURI__ !== 'undefined'`
7. **Capacitor** — `typeof window?.Capacitor?.isNative !== 'undefined'`
8. **Browser** — `typeof window !== 'undefined'`
9. **WebWorker** — `typeof self !== 'undefined' && typeof Window === 'undefined'`

- `platform: 'cirrus' | 'node' | 'browser' | 'worker' | 'deno' | 'bun' | 'electron' | 'tauri' | 'capacitor' | 'unknown'`
- Все `is*` boolean

### 3. Architecture — архитектура CPU
```typescript
import { arch, isX64, isArm64 } from '@sky-modules/platform'
```

- `arch: 'x64' | 'arm64' | 'ia32' | 'wasm32' | 'unknown'`
- Cirrus: `process.arch` (через Node.js совместимость)
- Node: `process.arch`
- Browser/Tauri/Capacitor: `navigator.userAgent` / `navigator.platform`

### 4. OS — операционная система
```typescript
import { os, isMac, isWindows, isLinux, isAndroid, isIOS } from '@sky-modules/platform'
```

- `os: 'mac' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown'`
- Cirrus: `process.platform` (через Node.js совместимость)
- Node: `process.platform`
- Browser/Tauri/Capacitor: `navigator.userAgent`
- Capacitor: `window.Capacitor.getPlatform()` → `'ios' | 'android'`

### 5. `appPlatformTarget` — целевая платформа приложения
```typescript
import { appPlatformTarget } from '@sky-modules/platform'
```

- `appPlatformTarget: 'cirrus' | 'web' | 'node' | 'electron' | 'tauri' | 'capacitor' | 'react-native' | 'unknown'`

## Структура файлов

```
packages/platform/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── runsOnSide.ts
│   ├── runsOnSide.test.ts
│   ├── platformDetect.ts
│   ├── platformDetect.test.ts
│   ├── arch.ts
│   ├── arch.test.ts
│   ├── os.ts
│   ├── os.test.ts
│   ├── appPlatformTarget.ts
│   └── appPlatformTarget.test.ts
```

## Критерии успеха
- [ ] Все тесты проходят
- [ ] Typecheck чист
- [ ] Zero dependencies
- [ ] Cirrus — первый в порядке определения
- [ ] Tauri — в списке платформ и `appPlatformTarget`
- [ ] Capacitor — в списке платформ и `appPlatformTarget`
- [ ] API соответствует примерам