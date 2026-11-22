# @sky-modules/three

Узлы three.js для рендерера Solid 2 из `@sky-modules/jsx`: сцена описывается JSX, а изменение сигнала меняет одно свойство объекта без пересборки сцены.

Peer-зависимости: `@sky-modules/jsx`, `solid-js@2`, `three@^0.187`. Нужна настройка компиляции JSX из `@sky-modules/jsx` (плагин `solidUniversal` и `jsxImportSource`).

## Быстрый старт

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

Импорт пакета регистрирует теги через `defineElement`.

## `mountThree(view, parent)`

Рендерит JSX в готовый `Object3D` (сцену или группу) и возвращает `dispose`. Камера, рендерер и цикл кадров остаются за приложением.

## Теги

- Объекты: `group`, `mesh`, `line`, `lineLoop`, `lineSegments`, `points`, `ambientLight`, `directionalLight`, `pointLight`, `spotLight`, `hemisphereLight`.
- Геометрии: `bufferGeometry`, `boxGeometry`, `sphereGeometry`, `cylinderGeometry`, `coneGeometry`, `capsuleGeometry`, `torusGeometry`, `ringGeometry`, `planeGeometry`, `circleGeometry`, `icosahedronGeometry`, `dodecahedronGeometry`, `edgesGeometry`, `shapeGeometry`.
- Материалы: `meshBasicMaterial`, `meshStandardMaterial`, `meshPhysicalMaterial`, `lineBasicMaterial`, `pointsMaterial`, `shaderMaterial`.

Геометрия и материал внутри `mesh`, `line` или `points` становятся его `geometry` и `material`.

## Свойства

| Свойство | Поведение |
| --- | --- |
| `position`, `scale` | `[x, y, z]` или любой объект `{ x, y, z }`; `scale` принимает и число |
| `rotation` | `[x, y, z]` или любой объект `{ x, y, z, order }` |
| `lookAt` | точка `[x, y, z]` или `{ x, y, z }` |
| `args` | аргументы конструктора геометрии или материала; при изменении объект пересоздаётся, старый освобождается. У объектов (`mesh`, `group`…) — ошибка |
| поля-`Color` (`color`, `emissive`) | `Color.set(value)` |
| поля-векторы и `Euler` | кортеж или структурно совместимый объект |
| остальные поля | присваиваются; материал получает `needsUpdate = true` только если поле меняет шейдерную программу (`transparent`, `side`, текстуры…), а не uniform-значения вроде `opacity` и `roughness` |
| `ref` | получает `ThreeNode`; сам объект three — в `node.object` |

Типы свойств выводятся из классов three. Векторы проверяются по структуре, а не через `instanceof`, поэтому подходят и `@sky-modules/math`, и вторая копия `three`.

## Освобождение ресурсов

Геометрии и материалы освобождаются, когда Solid уничтожает владельца, который их создал: ветка `<Show>`, элемент `<For>` или весь `mountThree`. Перемещение узла их не освобождает.

## Playground

<Playground name="three" />
