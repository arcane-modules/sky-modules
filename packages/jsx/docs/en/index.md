# @sky-modules/jsx

A universal JSX runtime built on SolidJS. It re-exports `solid-js`, provides the JSX factory functions and a custom Solid renderer that can drive any scene graph (canvas, three, your own engine) instead of the DOM.

`solid-js` is a peer dependency.

## TypeScript setup

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@sky-modules/jsx"
    }
}
```

The package exports `jsx`, `jsxs` (production), `jsxDEV` (development) and the `JSX` namespace through the subpaths `@sky-modules/jsx/jsx-runtime` and `@sky-modules/jsx/jsx-dev-runtime`.

## What JSX produces

`jsx(type, props)` returns a plain object `{ type, props }`. No work happens at creation time: a renderer decides what the object means.

```tsx
// <box x={10}>Hello</box>
jsx('box', { x: 10, children: 'Hello' })
```

`Fragment` is the string `'Fragment'`.

## JSX types

`JSX.FC<P>` is a function component type. `JSX.Element` is `{ type, props, children? }`, `JSX.Node` covers elements, text nodes, arrays, strings, numbers, booleans, `null` and `undefined`. Intrinsic elements accept any tag.

## Universal renderer

`@sky-modules/jsx/jsx-universal` creates a Solid renderer (`createRenderer`) with these exports:

`render`, `effect`, `memo`, `createElement`, `createTextNode`, `insert`, `spread`, `setProp`, `mergeProps`, `createComponent`. The root package re-exports them too.

Elements are plain `{ type, props }` objects, and text is `{ type: 'text', value }`. Function components are called directly with their props.

### Engine elements

To make a node of your own engine part of the JSX tree, implement `EngineElement`:

```ts
interface EngineElement {
    setJSXProperty(name: string, value: unknown): void
    addJSXChild(child: unknown): void
    removeJSXChild(child: unknown): void
    getJSXParent(): EngineElement | null
    getJSXFirstChild(): EngineElement | null
    getJSXNextSibling(): EngineElement | null
}
```

When the renderer meets an object with all six methods, it calls them instead of mutating `props`.

## Related packages

`@sky-modules/canvas`, `@sky-modules/three` and `@sky-modules/router` use these JSX types.

## Playground

<Playground name="jsx" />
