# Fusion Components

## Universal Cross-Framework Component Transpiler

**Fusion Components** — это универсальный инструмент для создания компонентов, которые работают во всех фреймворках одновременно!

## Что такое Fusion Components?

Fusion Components позволяет писать компоненты один раз на универсальном синтаксисе и автоматически компилировать их в специфичные реализации для React, Vue, SolidJS, Svelte, Angular, Lit и Qwik.

## Как это работает

### Исходник

```typescript
// Button.x.tsx - универсальный компонент
export default function Button(props) {
    const [count, setCount] = useStore({ count: 0 })
    
    return (
        <button onClick={() => setCount(count + 1)}>
            {props.label}: {count}
        </button>
    )
}
```

### Компиляция

Во время сборки Fusion Components автоматически генерирует:

- `Button.x.js` — React версия
- `Button.x.vue` — Vue версия  
- `Button.x.ts` — SolidJS/Svelte версия
- `Button.x.ts` — Angular версия
- `Button.x.lite.tsx` — Lit версия
- `Button.x.qwik.ts` — Qwik версия

## Поддерживаемые фреймворки

- ✅ React
- ✅ Vue
- ✅ SolidJS
- ✅ Svelte
- ✅ Angular
- ✅ Lit
- ✅ Qwik

## Установка

```bash
pnpm add @sky-modules/universal
```

## Использование

### Создание универсального компонента

```typescript
// Button.x.tsx
import { Fusion } from '@sky-modules/universal'

export default function Button(props) {
    // Универсальный код
    return <button>{props.label}</button>
}
```

### Импортирование в фреймворке

**React:**
```typescript
import { Button } from '@sky-modules/universal/react'
```

**Vue:**
```vue
<script setup>
import { Button } from '@sky-modules/universal/vue'
</script>

<template>
  <Button label="Нажми меня" />
</template>
```

**SolidJS:**
```typescript
import { Button } from '@sky-modules/universal/solid'
```

## Архитектура

Fusion Components использует кастомный regex-based parser (не Mitosis):

```
packages/universal/
├── src/
│   ├── core/
│   │   └── transpiler/
│   │       ├── index.ts              # основной экспорты
│   │       ├── parser/               # regex-based parser
│   │       │   └── index.ts
│   │       ├── generators/           # 7 генераторов для каждого фреймворка
│   │       │   ├── react.ts
│   │       │   ├── vue.ts
│   │       │   ├── solid.ts
│   │       │   ├── svelte.ts
│   │       │   ├── angular.ts
│   │       │   ├── lit.ts
│   │       │   └── qwik.ts
│   │       └── README.md             # эта документация
```

## Почему Fusion Components?

### Преимущества

1. **Пиши раз, запускай везде** — один исходник, все фреймворки
2. **Типобезопасность** — полная поддержка TypeScript
3. **Автоматическая компиляция** — сборка обрабатывает всё
4. **Маленький размер** — tree-shakeable модули
5. **Нет зависимости от Mitosis** — кастомная реализация

### Сравнение с Mitosis

| Характеристика | Fusion Components | Mitosis |
|----------------|-------------------|---------|
| Parser | Regex-based | Oxc-parser |
| Зависимости | Только TypeScript | Mitosis |
| Размер | ~500 bytes/component | ~20KB |
| Кастомизация | Полный контроль | Ограничено |
| Лицензия | MIT | MIT |

## Примеры компонентов

### Кнопка

```typescript
// Button.x.tsx
export default function Button(props) {
    return <button class="btn">{props.label}</button>
}
```

### Форм-поле

```typescript
// Input.x.tsx
export default function Input(props) {
    const value = useStore({ value: '' })
    
    return (
        <input
            value={value.value}
            onInput={(e) => value.value = e.target.value}
        />
    )
}
```

### Чекбокс

```typescript
// Checkbox.x.tsx
export default function Checkbox(props) {
    const checked = useStore({ checked: false })
    
    return (
        <input
            type="checkbox"
            checked={checked.checked}
            onChange={(e) => checked.checked = e.target.checked}
        />
    )
}
```

## Структура проекта

```
packages/universal/
├── src/
│   ├── core/
│   │   └── transpiler/
│   │       ├── index.ts              # экспорты
│   │       ├── parser/
│   │       │   └── index.ts         # regex parser
│   │       ├── generators/          # 7 генераторов
│   │       │   ├── react.ts
│   │       │   ├── vue.ts
│   │       │   ├── solid.ts
│   │       │   ├── svelte.ts
│   │       │   ├── angular.ts
│   │       │   ├── lit.ts
│   │       │   └── qwik.ts
│   │       └── README.md            # эта документация
│   ├── buttons/
│   │   ├── Button.x.tsx             # исходник
│   │   └── index.ts
│   ├── design-system/
│   │   ├── Box.tsx                  # Box компонент
│   │   ├── PandaBox.tsx             # Box с Panda CSS
│   │   ├── DesignTokens.ts          # дизайн-токены
│   │   ├── foundation.ts            # foundation токены
│   │   ├── semantic.ts              # semantic токены
│   │   ├── layout.ts                # layout токены
│   │   ├── scheme.ts                # схемы цветов
│   │   ├── theme.ts                 # light/dark темы
│   │   ├── Box.test.tsx             # тесты
│   │   └── index.ts                 # экспорты
│   ├── behavior/
│   │   └── machines/
│   │       └── robot3/               # state machine
│   │           └── index.ts
│   └── SlotRoot/
│       ├── SlotRootProvider.tsx     # provider
│       ├── getSlotRoot.ts           # hook
│       ├── SlotRoot.context.ts      # context
│       └── index.ts
└── package.json
```

## Тестирование

```bash
pnpm test
```

## Лицензия

MIT
