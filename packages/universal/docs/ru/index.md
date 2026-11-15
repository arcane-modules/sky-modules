# @sky-modules/universal

Кроссфреймворковые компоненты, дизайн-система и небольшой транспилятор «универсальных» исходников компонентов.

У пакета несколько точек входа:

| Импорт | Содержимое |
| --- | --- |
| `@sky-modules/universal` | `Button` и `ButtonProps` |
| `@sky-modules/universal/react`, `/vue`, `/solid`, `/svelte`, `/qwik`, `/angular`, `/lit` | Один и тот же исходник `Button.x.tsx` для инструментов каждого фреймворка |
| `@sky-modules/universal/design-system` | Дизайн-токены, `Box`, `PandaBox` |
| `@sky-modules/universal/SlotRoot` | Контекст стилей слотов |
| `@sky-modules/universal/transpiler` | Парсер и генераторы для фреймворков |
| `@sky-modules/universal/behavior/machines/robot3` | Примитивы конечных автоматов из `robot3` |

## Button

```tsx
import { Button } from '@sky-modules/universal/react'

<Button label="Save" variant="primary" onClick={() => save()} />
```

| Prop | Тип | По умолчанию |
| --- | --- | --- |
| `label` | `string` | `'Button'` |
| `onClick` | `() => void` | нет |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` (показывает спиннер и блокирует кнопку) |
| `fullWidth` | `boolean` | `false` |

## Дизайн-система

### Токены

`DesignTokens` описывает систему целиком: `name`, `foundation` (цвета, типографика, отступы, тени, скругления), `semantic` (палитры, состояния, ссылки), `layout` (контейнеры, брейкпоинты, сетка), необязательные `themes` и `schemes`, а также необязательное `extends`. `DesignTokensDescription` — частичная форма (обязательно только `name`). `defaultTokens` даёт значения по умолчанию:

```ts
import { defaultTokens } from '@sky-modules/universal/design-system'

const appTokens = { ...defaultTokens, name: 'my-app' }
```

### Box

`Box` — полиморфный контейнер. `as` выбирает тег (`div`, `span`, `section`, `article`, `header`, `footer`, `main`, `nav`, `aside`). Поддерживает `padding`, `margin`, `backgroundColor`, `borderRadius`, `className`, `style`, `sx`, `asChild` и `ref`. Стилевые props объединяются в `style`.

```ts
Box({ as: 'section', padding: '4', backgroundColor: '#fafafa', children: 'Content' })
```

### PandaBox

`PandaBox` принимает props `Box` и сокращения в стиле Panda (`p`, `px`, `py`, `m`, `bg`, `rounded`, `display`, `flexDirection`, `gap`, `textAlign`, `fontSize` и другие). `defaultPandaTheme` и `usePandaTheme()` описывают форму темы; `usePandaTheme()` сейчас возвращает пустой контекст.

`Box` и `PandaBox` создают элементы через React.

## SlotRoot

Передаёт классы слотов и контроллер вниз по дереву через контекст Solid.

```tsx
import { SlotRootProvider, getSlotStyles, useSlotRoot } from '@sky-modules/universal/SlotRoot'

<SlotRootProvider styles={{ trigger: 'px-4 py-2' }} controller={controller}>
    {children}
</SlotRootProvider>

const context = useSlotRoot()
getSlotStyles(context?.styles, 'trigger') // 'px-4 py-2'
```

`getSlotStyles` возвращает `''` для отсутствующего слота. `getSlotRoot()` делает то же, что `useSlotRoot()`.

## Конечные автоматы

`@sky-modules/universal/behavior/machines/robot3` реэкспортирует `createMachine`, `state`, `transition`, `invoke`, `immediate`, `guard`, `reduce`, `action` и `interpret` из [robot3](https://thisrobot.life), а также его типы.

## Транспилятор

Транспилятор на регулярных выражениях для компонентов `.x.tsx`.

```ts
import { ReactGenerator, parseSource, transpile } from '@sky-modules/universal/transpiler'

const parsed = parseSource(source)
const { code } = transpile(source, 'react', new ReactGenerator())
```

- `parseSource(source)` извлекает имя компонента из default-экспорта, деструктурированные props, объявления `useState`/`createState`/`useStore`, объявления `useEffect` и строки JSX из `return`.
- `transpile(source, framework, generator)` запускает генератор. Выбрасывает ошибку, если `generator.framework` не совпадает с `framework`.
- Генераторы: `ReactGenerator`, `SolidGenerator`, `VueGenerator`, `SvelteGenerator`, `QwikGenerator`, `AngularGenerator`, `LitGenerator`. У `Generator` есть поле `framework` и метод `generate(name, props, state, effects, jsxNodes)`, возвращающий `{ code, template? }` (`template` используется для Angular).

Парсер намеренно простой (регулярные выражения, а не AST), поэтому работает с конвенциями этого репозитория.
