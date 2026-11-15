# @sky-modules/three

A Three.js renderer driven by JSX-like element objects. Peer dependencies: `@sky-modules/jsx` and `three` (^0.160).

## Quick start

```ts
import { ThreeJSXRenderer } from '@sky-modules/three'

const renderer = new ThreeJSXRenderer(document.getElementById('app')!)

renderer.render({
    type: 'scene',
    props: { background: 0x111111 },
    children: [
        { type: 'ambientLight', props: { intensity: 0.6 } },
        { type: 'directionalLight', props: { position: [3, 5, 2] } },
        {
            type: 'mesh',
            props: { position: [0, 0, 0] },
            children: [
                { type: 'boxGeometry', props: { args: [1, 1, 1] } },
                { type: 'meshStandardMaterial', props: { color: 0x00ff00 } },
            ],
        },
    ],
})
```

## `ThreeJSXRenderer`

| Member | Description |
| --- | --- |
| `new ThreeJSXRenderer(container?)` | Creates a scene, a perspective camera (75°, positioned at `5, 5, 5` looking at the origin) and a clock. In a browser it also creates a `WebGLRenderer` and appends its canvas to `container`. |
| `render(element \| elements)` | Clears the scene, rebuilds it from the elements, then renders one frame. |
| `dispose()` | Removes objects, disposes geometries and materials, disposes the WebGL renderer. |
| `scene`, `camera`, `renderer`, `clock` | The underlying Three.js objects. |

Outside a browser no `WebGLRenderer` is created, which keeps the scene usable in tests.

## Elements

| Element | Props |
| --- | --- |
| `scene` | `background`, `fog` (type only) |
| `camera` | `position`, `rotation`, `lookAt`, `fov`, `aspect`, `near`, `far` (changes the renderer's camera) |
| `ambientLight` | `color`, `intensity` |
| `directionalLight` | `color`, `intensity`, `position`, `castShadow` |
| `pointLight` | `color`, `intensity`, `position`, `distance`, `decay` |
| `mesh` | `position`, `rotation`, `scale`, `visible`, `castShadow`, `receiveShadow`, `onUpdate` (stored by the renderer, but not called yet: there is no animation loop) |
| `group` | `position`, `rotation`, `scale`, `visible` |
| `boxGeometry` | `args`, defaults to `[1, 1, 1]` |
| `sphereGeometry` | `args`, defaults to `[1, 8, 6]` |
| `meshBasicMaterial` | `color` |
| `meshStandardMaterial` | `color`, `metalness` (default `0`), `roughness` (default `1`) |

Vectors are tuples `[x, y, z]`. Geometries and materials are children of a `mesh`. Unknown element types are ignored.

The `JSX.IntrinsicElements` typings for these elements are declared globally when you import the package.

## Playground

<Playground name="three" />
