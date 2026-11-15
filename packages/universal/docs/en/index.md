# @sky-modules/universal

Cross-framework components, a design system and a small transpiler for "universal" component sources.

The package has several entry points:

| Import | Content |
| --- | --- |
| `@sky-modules/universal` | `Button` and `ButtonProps` |
| `@sky-modules/universal/react`, `/vue`, `/solid`, `/svelte`, `/qwik`, `/angular`, `/lit` | The same `Button.x.tsx` source, for each framework's toolchain |
| `@sky-modules/universal/design-system` | Design tokens, `Box`, `PandaBox` |
| `@sky-modules/universal/SlotRoot` | Slot styles context |
| `@sky-modules/universal/transpiler` | Parser and framework generators |
| `@sky-modules/universal/behavior/machines/robot3` | State machine primitives from `robot3` |

## Button

```tsx
import { Button } from '@sky-modules/universal/react'

<Button label="Save" variant="primary" onClick={() => save()} />
```

| Prop | Type | Default |
| --- | --- | --- |
| `label` | `string` | `'Button'` |
| `onClick` | `() => void` | none |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` (shows a spinner and disables the button) |
| `fullWidth` | `boolean` | `false` |

## Design system

### Tokens

`DesignTokens` describes a complete system: `name`, `foundation` (colors, typography, spacing, shadows, border radius), `semantic` (palettes, states, references), `layout` (containers, breakpoints, grid), optional `themes` and `schemes`, and optional `extends`. `DesignTokensDescription` is the partial form (only `name` is required). `defaultTokens` provides defaults:

```ts
import { defaultTokens } from '@sky-modules/universal/design-system'

const appTokens = { ...defaultTokens, name: 'my-app' }
```

### Box

`Box` is a polymorphic container. `as` selects the tag (`div`, `span`, `section`, `article`, `header`, `footer`, `main`, `nav`, `aside`). It supports `padding`, `margin`, `backgroundColor`, `borderRadius`, `className`, `style`, `sx`, `asChild` and `ref`. The style props are merged into `style`.

```ts
Box({ as: 'section', padding: '4', backgroundColor: '#fafafa', children: 'Content' })
```

### PandaBox

`PandaBox` accepts the Box props plus Panda-style shorthands (`p`, `px`, `py`, `m`, `bg`, `rounded`, `display`, `flexDirection`, `gap`, `textAlign`, `fontSize`, ...). `defaultPandaTheme` and `usePandaTheme()` describe the theme shape; `usePandaTheme()` currently returns an empty context.

`Box` and `PandaBox` build elements with React.

## SlotRoot

Passes slot class names and a controller down the tree through a Solid context.

```tsx
import { SlotRootProvider, getSlotStyles, useSlotRoot } from '@sky-modules/universal/SlotRoot'

<SlotRootProvider styles={{ trigger: 'px-4 py-2' }} controller={controller}>
    {children}
</SlotRootProvider>

const context = useSlotRoot()
getSlotStyles(context?.styles, 'trigger') // 'px-4 py-2'
```

`getSlotStyles` returns `''` for a missing slot. `getSlotRoot()` does the same as `useSlotRoot()`.

## State machines

`@sky-modules/universal/behavior/machines/robot3` re-exports `createMachine`, `state`, `transition`, `invoke`, `immediate`, `guard`, `reduce`, `action` and `interpret` from [robot3](https://thisrobot.life), plus its types.

## Transpiler

A regex-based transpiler for `.x.tsx` components.

```ts
import { ReactGenerator, parseSource, transpile } from '@sky-modules/universal/transpiler'

const parsed = parseSource(source)
const { code } = transpile(source, 'react', new ReactGenerator())
```

- `parseSource(source)` extracts the default-exported component name, destructured props, `useState`/`createState`/`useStore` declarations, `useEffect` declarations and the JSX lines of the `return`.
- `transpile(source, framework, generator)` runs the generator. It throws when `generator.framework` differs from `framework`.
- Generators: `ReactGenerator`, `SolidGenerator`, `VueGenerator`, `SvelteGenerator`, `QwikGenerator`, `AngularGenerator`, `LitGenerator`. A `Generator` has a `framework` field and a `generate(name, props, state, effects, jsxNodes)` method returning `{ code, template? }` (`template` is used by Angular).

The parser is intentionally simple (regular expressions, not an AST), so it works for the conventions used in this repository.
