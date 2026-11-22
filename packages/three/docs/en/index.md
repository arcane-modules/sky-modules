# @sky-modules/three

three.js nodes for the Solid 2 renderer of `@sky-modules/jsx`: the scene is described with JSX, and a signal change updates one object property without rebuilding the scene.

Peer dependencies: `@sky-modules/jsx`, `solid-js@2`, `three@^0.187`. JSX compilation from `@sky-modules/jsx` is required (the `solidUniversal` plugin and `jsxImportSource`).

## Quick start

```tsx
import { createSignal } from '@sky-modules/jsx'
import { mountThree } from '@sky-modules/three'
import { Scene } from 'three'

const scene = new Scene()
const [angle, setAngle] = createSignal(0)

const dispose = mountThree(
    () => (
        <mesh rotation={[0, angle(), 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={0x3b82f6} roughness={0.4} />
        </mesh>
    ),
    scene
)

setAngle(Math.PI / 4) // applied on the next microtask or flush()
```

Importing the package registers the tags through `defineElement`.

## `mountThree(view, parent)`

Renders JSX into an existing `Object3D` (a scene or a group) and returns `dispose`. The camera, renderer and frame loop stay with the application.

## Tags

- Objects: `group`, `mesh`, `line`, `lineLoop`, `lineSegments`, `points`, `ambientLight`, `directionalLight`, `pointLight`, `spotLight`, `hemisphereLight`.
- Geometries: `bufferGeometry`, `boxGeometry`, `sphereGeometry`, `cylinderGeometry`, `coneGeometry`, `capsuleGeometry`, `torusGeometry`, `ringGeometry`, `planeGeometry`, `circleGeometry`, `icosahedronGeometry`, `dodecahedronGeometry`, `edgesGeometry`, `shapeGeometry`.
- Materials: `meshBasicMaterial`, `meshStandardMaterial`, `meshPhysicalMaterial`, `lineBasicMaterial`, `pointsMaterial`, `shaderMaterial`.

A geometry or material inside `mesh`, `line` or `points` becomes its `geometry` or `material`.

## Props

| Prop | Behavior |
| --- | --- |
| `position`, `scale` | `[x, y, z]` or any `{ x, y, z }` object; `scale` also accepts a number |
| `rotation` | `[x, y, z]` or any `{ x, y, z, order }` object |
| `lookAt` | point `[x, y, z]` or `{ x, y, z }` |
| `args` | constructor arguments of a geometry or material; a change recreates the object and disposes the old one. Throws on objects (`mesh`, `group`…) |
| `Color` fields (`color`, `emissive`) | `Color.set(value)` |
| vector and `Euler` fields | a tuple or a structurally compatible object |
| other fields | assigned; a material gets `needsUpdate = true` only when the field changes its shader program (`transparent`, `side`, textures…), not for uniform values like `opacity` or `roughness` |
| `ref` | receives the `ThreeNode`; the three object is `node.object` |

Prop types are derived from the three classes. Vectors are checked by shape, not `instanceof`, so `@sky-modules/math` and a second copy of `three` both work.

## Disposal

Geometries and materials are disposed when Solid disposes the owner that created them: a `<Show>` branch, a `<For>` item or the whole `mountThree`. Moving a node does not dispose it.

## Playground

<Playground name="three" />
