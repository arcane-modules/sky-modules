# Mitosis — Кросс-фреймворк компоненты

## Обзор

**Mitosis** — это система для написания универсальных UI-компонентов, которые автоматически компилируются в несколько фреймворков: React, Vue, Solid, Svelte, Lit, Qwik, Angular.

## Архитектура

### Структура файлов

```
universal/
├── Component/
│   ├── Component.lite.tsx       # Исходник Mitosis (.x.tsx или .lite.tsx)
│   ├── Component.lite.css       # Стили
│   └── index.lite.ts            # Экспорты
```

### Компиляция

Компоненты автоматически компилируются во время сборки:

```bash
sky mitosis build <app-name>
```

Вывод генерируется в директории `.dev/mitosis/`:

```
.dev/mitosis/
├── react/           # React compiled components
├── vue/             # Vue compiled components
├── svelte/          # Svelte compiled components
├── solid/           # Solid compiled components
├── angular/         # Angular compiled components
├── qwik/            # Qwik compiled components
└── lit/             # Lit compiled components
```

## Поддерживаемые фреймворки

| Фреймворк | Расширение | Особенности |
|-----------|------------|--------------|
| React | `.tsx` | className, useState, useEffect |
| Vue | `.vue` | defineProps, ref, onMounted |
| Solid | `.tsx` | class, createSignal, onCleanup |
| Svelte | `.svelte` | $props(), $state, runes |
| Lit | `.ts` | @property, @state, html`` |
| Qwik | `.tsx` | component$, useSignal, useVisibleTask$ |
| Angular | `.ts` | @Input, @Output, @Component |

## Как это работает

### 1. Парсинг

Использует `oxc-parser` (Rust) для парсинга `.x.tsx` файлов в AST (Intermediate Representation - IR).

### 2. Транспирация

Для каждого фреймворка используется свой генератор (`generators/`):

- **ReactGenerator** — классический React с JSX
- **VueGenerator** — Vue Single File Components
- **SolidGenerator** — Solid.js с createSignal
- **SvelteGenerator** — Svelte 5 с runes
- **LitGenerator** — Lit elements
- **QwikGenerator** — Qwik components
- **AngularGenerator** — Angular components

### 3. Генерация

Каждый генератор трансформирует IR в целевой код:

- Трансформирует хуки (`useState` → `ref` / `createSignal`)
- Трансформирует JSX в шаблонный синтаксис
- Добавляет framework-specific импорты
- Генерирует type definitions

## Примеры

### Исходный компонент (.lite.tsx)

```tsx
// Button.lite.tsx
import { useStore } from '@builder.io/mitosis'

export default function Button(props) {
    const state = useStore({
        count: 0
    })

    return (
        <button onClick={() => state.count++}>
            {props.label}: {state.count}
        </button>
    )
}
```

### React

```tsx
import { Button } from '@sky-modules/universal/react'

<Button label="Нажми меня" />
```

### Vue

```vue
<script setup>
import { Button } from '@sky-modules/universal/vue'
</script>

<template>
    <Button label="Нажми меня" />
</template>
```

### Solid

```tsx
import { Button } from '@sky-modules/universal/solid'

<Button label="Нажми меня" />
```

## API

### Генераторы

- `ReactGenerator` — React
- `VueGenerator` — Vue
- `SolidGenerator` — Solid
- `SvelteGenerator` — Svelte
- `LitGenerator` — Lit
- `QwikGenerator` — Qwik
- `AngularGenerator` — Angular

### Утилиты

- `transpile(sourceCode, framework, filePath)` — Транспиляция кода
- `transpileFile(filePath, framework)` — Транспиляция файла
- `transpileDirectory(inputDir, outputDir, framework)` — Транспиляция директории
- `getGenerator(framework)` — Получение генератора
- `getAvailableFrameworks()` — Список поддерживаемых фреймворков

## Конфигурация

### sky.config.ts

```typescript
export default {
    id: 'sky.universal',
    package: '@sky-modules/universal',
    publishable: true,
    jsx: 'mitosis',
    proxyModules: ['mitosis'],
}
```

### Плагин для Vite

```typescript
import { skyMitosisPlugin } from '@sky-modules/cli/plugins/vite'

export default {
    plugins: [skyMitosisPlugin()],
}
```

## Связанные модули

- [@sky-modules/universal](../universal) — Универсальные компоненты
- [@sky-modules/design](../design) — Design System
- [@sky-modules/behavior](../behavior) — State machines (robot3)
- [@sky-modules/cli](../cli) — CLI и транспилятор

## Лицензия

ISC
