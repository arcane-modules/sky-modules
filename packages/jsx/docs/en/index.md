# @sky-modules/jsx

A Solid 2 universal renderer: reactive JSX for any scene graph (canvas, three, your own engine) instead of the DOM.

JSX is compiled by `@solidjs/compiler` in `universal` mode. JSX expressions become fine-grained reactive bindings: when a signal changes, only the bound node property updates.

`solid-js@2` is a peer dependency.

## Setup

`vite.config.ts`:

```ts
import { solidUniversal } from '@sky-modules/jsx/vite'

export default { plugins: [solidUniversal()] }
```

The plugin compiles `.jsx`/`.tsx` (outside `node_modules`) and adds the `browser` condition: otherwise `solid-js` resolves to its non-reactive server build in Node. It works with Vite 7 and Vitest 3.

`tsconfig.json`:

```json
{
    "compilerOptions": {
        "jsx": "preserve",
        "jsxImportSource": "@sky-modules/jsx"
    }
}
```

## Quick start

```tsx
import { createSignal, flush, JSXElementNode, render, Show } from '@sky-modules/jsx'

const [count, setCount] = createSignal(0)
const root = new JSXElementNode('root')

const dispose = render(
    () => (
        <counter value={count()}>
            <Show when={count() > 0}>
                <badge kind="positive" />
            </Show>
        </counter>
    ),
    root
)

setCount(1)
flush() // Solid 2 applies writes after a microtask; flush() applies them now
```

## Nodes

The renderer drives the `JSXNode` interface:

```ts
interface JSXNode {
    setJSXProperty(name: string, value: unknown, prev: unknown): void
    insertJSXChild(child: JSXNode, anchor: JSXNode | undefined): void
    removeJSXChild(child: JSXNode): void
    getJSXChildren(): readonly JSXNode[]
    disposeJSX?(): void
}
```

- `JSXElementNode` is the default node: `tag`, `props`, `children`.
- `JSXTextNode` is text (`value`). It is told apart by class, so a `<text>` tag never collides with it.
- The renderer tracks parents. A node is detached from its previous position before insertion, as with DOM `insertBefore`.
- `disposeJSX` (optional) releases engine resources. It is called once when Solid disposes the owner that created the node: a `<Show>` branch, a `<For>` item or the whole `render`. Moving a node does not call it.
- `ref` receives the node. `JSXRef` is bivariant, so an engine may narrow the node type for its tags.

### Engine nodes

`defineElement(tag, factory)` registers a node factory for a tag. Tags without a factory create `JSXElementNode`. Registering a tag twice throws.

```ts
defineElement('sprite', () => new SpriteNode())
```

Static JSX props are applied through `setJSXProperty` right after the node is created.

## Exports

- Renderer functions called by compiled JSX: `render`, `effect`, `memo`, `createComponent`, `createElement`, `createTextNode`, `insertNode`, `insert`, `spread`, `setProp`, `mergeProps`, `applyRef`, `ref`.
- `JSXNode`, `JSXElementNode`, `JSXTextNode`, `defineElement`, `createNode`.
- Everything from `solid-js` (`createSignal`, `flush`, `For`, `Show`…): the compiler imports built-in components from `@sky-modules/jsx`.
- Types: `JSX`, `IntrinsicProps`.

## Playground

<Playground name="jsx" />
