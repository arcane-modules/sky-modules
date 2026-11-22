# `@sky-modules/three` на рендерере Solid 2

## Контекст
`@sky-modules/three` строил сцену из объектов `{ type, props }` (`ThreeJSXRenderer`): каждый `render()` пересобирал всю сцену, реактивности не было, `three@0.160`. После перевода `@sky-modules/jsx` на Solid 2 universal пакет должен стать набором узлов three для этого рендерера.

## Цель
JSX-описание сцены three.js с точечной реактивностью: изменился сигнал — изменилось одно свойство объекта.

```tsx
import { mountThree } from '@sky-modules/three'

const dispose = mountThree(
    () => (
        <group position={[0, 1, 0]}>
            <mesh rotation={[0, angle(), 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color()} roughness={0.4} />
            </mesh>
        </group>
    ),
    scene
)
```

## Решения

### Узел
`ThreeNode<T>` реализует `JSXNode` и держит объект three (`object`): `Object3D`, `BufferGeometry` или `Material`.

- Дети-`Object3D` добавляются через `add`/`remove`.
- Ребёнок-геометрия становится `geometry` родителя, ребёнок-материал — `material` родителя (`Mesh`, `Line`, `Points`).
- Текстовые узлы хранятся в списке детей для навигации рендерера, но в three не попадают.
- `disposeJSX` освобождает геометрию или материал. Вызывается, когда Solid уничтожает владельца, создавшего узел (см. `JSXNode.disposeJSX`).

### Свойства
| Свойство | Поведение |
|---|---|
| `position`, `scale` | кортеж `[x, y, z]` или вектор; `scale` принимает и число |
| `rotation` | кортеж `[x, y, z]` или `Euler` |
| `lookAt` | кортеж или вектор, вызывает `object.lookAt` |
| `args` | аргументы конструктора; только для геометрий и материалов: объект пересоздаётся, старый освобождается, новый подключается к родителю |
| поле-`Color` (`color`, `emissive`…) | `Color.set(value)` |
| поле-вектор / `Euler` | кортеж → `set(...)`, объект → `copy` |
| остальное | присваивание; `needsUpdate = true` у материала только для полей, меняющих шейдерную программу (не-числа и `side`, `alphaTest`…). Цвета и числа-uniform (`opacity`, `roughness`) программу не пересобирают |
| векторы | проверяются по структуре (`{ x, y, z }`), а не `instanceof`: подходит `@sky-modules/math` и вторая копия `three` |

`args` у `Object3D` — ошибка: пересоздание потеряло бы детей и трансформ.

### Теги
Регистрируются через `defineElement` при импорте пакета:
- объекты: `group`, `mesh`, `line`, `lineLoop`, `lineSegments`, `points`, `ambientLight`, `directionalLight`, `pointLight`, `spotLight`, `hemisphereLight`;
- геометрии: `bufferGeometry`, `boxGeometry`, `sphereGeometry`, `cylinderGeometry`, `coneGeometry`, `capsuleGeometry`, `torusGeometry`, `ringGeometry`, `planeGeometry`, `circleGeometry`, `icosahedronGeometry`, `dodecahedronGeometry`, `edgesGeometry`, `shapeGeometry`;
- материалы: `meshBasicMaterial`, `meshStandardMaterial`, `meshPhysicalMaterial`, `lineBasicMaterial`, `pointsMaterial`, `shaderMaterial`.

Типы `JSX.IntrinsicElements` выводятся из классов three: `args` — `ConstructorParameters`, остальные свойства — поля экземпляра.

### Монтирование
`mountThree(view, parent: Object3D): () => void` — корень оборачивает готовый объект (сцену или группу), возвращает `dispose`.

### Удаляется
`ThreeJSXRenderer` и объектная модель `{ type, props }`.

### Зависимости
`three` и `@types/three` `^0.187.0` (как в glyphoria), `solid-js@^2.0.3`.

## Тесты (vitest + `solidUniversal`)
- монтирование: иерархия `Object3D`, геометрия и материал меша;
- реактивные `position`, `rotation`, `color` после `flush()`;
- `args` пересоздаёт геометрию и подключает её к мешу, старая освобождается;
- `<Show>` удаляет объект из сцены и освобождает его геометрию и материал;
- `dispose` из `mountThree` очищает родителя;
- `args` у `Object3D` — ошибка.

## Критерии готовности
- tsc, vitest, biome проходят; плейграунд переписан; документация en/ru обновлена.
