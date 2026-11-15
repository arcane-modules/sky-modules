# Аудит существующих модулей + порт jsx и vike

## Контекст

В процессе разработки `@sky-modules` монорепозитория были обнаружены критические ошибки в существующих пакетах, а также необходимость перенести из старого проекта пакеты `jsx` и `vike`.

## Цель

1. Исправить все критические ошибки в существующих пакетах, чтобы `pnpm run typecheck` и `pnpm run test` проходили без ошибок.
2. Создать и интегрировать пакеты `@sky-modules/jsx` и `@sky-modules/vike` на основе старого проекта.

## Что изменится

### Исправления существующих модулей

1. `packages/schema/src/types.ts` — исправить синтаксическую ошибку `createModifiedDecorator` и дублирование `Class`.
2. `packages/core/` — удалить пустой пакет с sync-conflict файлами.
3. `packages/universal/package.json` — привести к единому формату с остальными пакетами.
4. `packages/universal/tsconfig.json` — исправить путь к `tsconfig.base.json`.
5. `packages/universal/src/design-system/PandaConfig.ts` — убрать циклический экспорт.
6. `packages/universal/src/design-system/index.ts` — убрать дублирование `PandaThemeContext`.
7. `packages/universal/src/design-system/Box.tsx` — добавить импорт React и зависимость.
8. `packages/universal/src/design-system/PandaBox.tsx` — добавить импорт React, убрать дублирование свойств.
9. `packages/universal/src/SlotRoot/` — полностью переработать: использовать SolidJS context API, убрать Map, исправить default exports.
10. `packages/universal/src/core/transpiler/index.ts` — исправить рекурсивный экспорт.
11. `packages/universal/src/core/transpiler/parser/index.ts` — создать недостающий parser.
12. `packages/universal/src/buttons/Button.x.tsx` — заменить импорт `@sky-modules/x` на `@sky-modules/jsx`.
13. `packages/universal/src/buttons/index.ts` — исправить путь к файлу.
14. `packages/universal/src/behavior/machines/robot3/package.json` — исправить зависимость robot3, добавить scripts/main/types.
15. Создать корневой `tsconfig.base.json`.

### Новые пакеты

1. `packages/jsx/` — Universal JSX runtime на базе SolidJS.
2. `packages/vike/` — Интеграция с Vike (SSR, PageContext, helpers).

## Детали реализации

### Phase 1: Исправления

#### 1.1 `packages/schema/src/types.ts`

```typescript
function createModifiedDecorator<T extends PropertyKey>(
    modifier: Modifier,
    schemaType: unknown,
): (target: object, key: T) => void {
    const wrappedSchema = { ... }
    return (target, key) => { ... }
}
```

Убрать дублирующую сигнатуру и убрать дублирующее определение `Class`.

#### 1.2 `packages/core/`

Удалить пакет, так как пользователь ранее запрашивал его удаление и он пустой.

#### 1.3 `packages/universal/package.json`

Привести к формату:

```json
{
    "name": "@sky-modules/universal",
    "version": "0.0.0",
    "type": "module",
    "private": true,
    "main": "./src/buttons/index.ts",
    "types": "./src/buttons/index.ts",
    "scripts": {
        "typecheck": "tsc --noEmit",
        "test": "vitest run"
    },
    "dependencies": {
        "robot3": "^0.4.2"
    },
    "devDependencies": {
        "typescript": "^5.9.3",
        "vitest": "^3.2.4"
    }
}
```

#### 1.4 `packages/universal/tsconfig.json`

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "jsx": "preserve",
        "jsxImportSource": "solid-js",
        "types": ["vitest/globals"]
    },
    "include": ["src/**/*"]
}
```

#### 1.5 Design system

- `Box.tsx` / `PandaBox.tsx`: добавить `import * as React from 'react'` и `react` в devDependencies.
- `PandaConfig.ts`: убрать циклический экспорт.
- `index.ts`: убрать дублирование `PandaThemeContext`.

#### 1.6 SlotRoot

Переработать на SolidJS context:

```typescript
// SlotRoot.context.ts
import { createContext, useContext } from 'solid-js'

export interface SlotRootContextType { ... }
export const SlotRootContext = createContext<SlotRootContextType>()
export const useSlotRoot = () => useContext(SlotRootContext)
export function getSlotStyles(styles, slot) { ... }

// SlotRootProvider.tsx
import { SlotRootContext } from './SlotRoot.context'
export default function SlotRootProvider(props) {
    return (
        <SlotRootContext.Provider value={{ styles: props.styles, controller: props.controller }}>
            {props.children}
        </SlotRootContext.Provider>
    )
}

// getSlotRoot.ts
export { useSlotRoot as default, useSlotRoot }
```

#### 1.7 Transpiler

- Создать `parser/index.ts` с базовым regex-based parser.
- Исправить `index.ts` чтобы экспортировать `transpile` и `parseSource` из parser/generators.

```typescript
// transpiler/index.ts
export { transpile, parseSource } from './parser'
export type { Framework, TranspileResult } from './types'
export * from './react'
...
```

#### 1.8 Buttons

- `Button.x.tsx`: `import type { JSX } from '@sky-modules/jsx'`
- `index.ts`: `export { default as Button, type ButtonProps } from './Button.x.tsx'`

#### 1.9 `tsconfig.base.json`

Создать в корне:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "lib": ["ESNext", "DOM"],
        "strict": true,
        "noEmit": true,
        "isolatedModules": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": false,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "experimentalDecorators": true,
        "useDefineForClassFields": false
    }
}
```

### Phase 2: Новый пакет `@sky-modules/jsx`

Структура:

```
packages/jsx/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── JSX.ts
│   ├── jsx-runtime.ts
│   ├── jsx-dev-runtime.ts
│   ├── jsx-universal.ts
│   ├── jsx-universal.test.ts
│   └── JSX.test.ts
```

Контент:
- `JSX.ts` — типы и re-export SolidJS primitives.
- `jsx-runtime.ts` — `jsx()`, `jsxs()`, `Fragment`.
- `jsx-dev-runtime.ts` — `jsxDEV()`.
- `jsx-universal.ts` — custom SolidJS universal renderer.
- Тесты для базовых сценариев.

Зависимости:
- peerDependency: `solid-js`
- devDependencies: `typescript`, `vitest`

### Phase 3: Новый пакет `@sky-modules/vike`

Структура:

```
packages/vike/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── helpers/
│   │   ├── index.ts
│   │   ├── callCumulativeHooks.ts
│   │   ├── getCumulativeStrings.ts
│   │   ├── getHeadSetting.ts
│   │   ├── mergeTagAttributes.ts
│   │   └── helpers.test.ts
│   └── async-data/
│       ├── index.ts
│       └── config.ts
```

Контент:
- `helpers/` — utilities для Vike config/html.
- `async-data/` — базовая конфигурация async-data hook.
- Тесты для helpers.

Зависимости:
- peerDependency: `vike`
- devDependencies: `typescript`, `vitest`

## Критерии приёмки

- [x] `pnpm run typecheck` проходит без ошибок для всех пакетов.
- [x] `pnpm run test` проходит без ошибок (480+ тестов).
- [x] Пакет `@sky-modules/jsx` создан с тестами.
- [x] Пакет `@sky-modules/vike` создан с тестами для helpers.
- [x] `packages/core/` удалён.
- [x] `tsconfig.base.json` создан в корне.
- [x] `packages/universal` typecheck проходит.
- [x] SlotRoot использует SolidJS context API корректно.
- [x] Fusion Components transpiler имеет parser и корректные экспорты.
- [x] Button.x.tsx импортирует JSX из `@sky-modules/jsx`.
