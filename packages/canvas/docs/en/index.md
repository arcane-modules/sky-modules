# @sky-modules/canvas

A small 2D canvas scene graph with geometries, materials and an optional JSX front end. It follows the Three.js vocabulary: scene, mesh, geometry, material, renderer. `@sky-modules/jsx` is a peer dependency.

## Quick start

```ts
import { BasicMaterial, CanvasRenderer, Mesh, RectGeometry, Scene } from '@sky-modules/canvas'

const scene = new Scene()
scene.background = '#111111'

const box = new Mesh(new RectGeometry({ width: 100, height: 60, radius: 8 }), new BasicMaterial({ color: '#3b82f6' }))
box.x = 50
box.y = 40
scene.add(box)

const renderer = new CanvasRenderer({ size: () => [800, 600], pixelRatio: 2 })
document.body.appendChild(renderer.domElement)
renderer.render(scene)
```

## Core

### `CanvasRenderer`

| Member | Description |
| --- | --- |
| `new CanvasRenderer({ canvas?, size, pixelRatio? })` | Uses the given canvas or creates one. `size()` returns `[width, height]`. Throws when there is no canvas, no `document`, or no 2D context. |
| `domElement`, `drawContext`, `pixelRatio` | The canvas, its 2D context and the pixel ratio (default `1`). |
| `onResize()` | Applies the current size and pixel ratio. |
| `clear()` | Clears the canvas. |
| `render(scene)` | Resizes, clears, paints `scene.background` and renders all children. |

### `Object2D`

The base node class. Fields: `x`, `y`, `rotation` (radians), `scaleX`, `scaleY`, `visible`, `parent`, `children`. Methods: `add(child)`, `remove(child)`, `getTransform()`, `render(ctx)` (applies translate, rotate, scale, calls `draw`, renders children) and `draw(ctx)` for subclasses to override.

### `Scene`, `Group`, `Mesh`

- `Scene` is the root and has an optional `background` color.
- `Group` is an empty container.
- `Mesh(geometry, material)` applies the material, then draws the geometry.

## Geometries

A geometry implements `draw(ctx)`.

| Class | Parameters |
| --- | --- |
| `RectGeometry` | `width`, `height`, `x?`, `y?`, `radius?` (rounded corners) |
| `CircleGeometry` | `radius`, `x?`, `y?` |

## Materials

A material implements `apply(ctx)`.

| Class | Parameters |
| --- | --- |
| `BasicMaterial` | `color` (fill) |
| `FillStrokeMaterial` | `fill?`, `stroke?`, `strokeWidth?` (default `1`) |

## JSX

`createCanvasObject(element)` converts an element description `{ type, props }` (`CanvasElement`: a tag `rect`/`circle`/`group` or a component) into scene objects and returns `null` for unknown tags. It does not use the Solid renderer of `@sky-modules/jsx`.

| Tag | Props |
| --- | --- |
| `rect` | `width`, `height`, `radius`, `fill`, `stroke`, `strokeWidth` |
| `circle` | `radius`, `fill`, `stroke`, `strokeWidth` |
| `group` | none |

All tags also accept `x`, `y`, `rotation`, `scaleX`, `scaleY`, `visible` and nested children. Function components are called and their result is converted. A shape with `stroke` uses `FillStrokeMaterial`, otherwise `BasicMaterial` (default fill `#000000`).

## Types

`CanvasRendererParameters`, `Transform2D`, `Geometry`, `Material`, `RectGeometryParameters`, `CircleGeometryParameters`, `BasicMaterialParameters`, `FillStrokeMaterialParameters`, `CanvasElement`, `CanvasComponent`, `CanvasJSXNode`.

## Playground

<Playground name="canvas" />
