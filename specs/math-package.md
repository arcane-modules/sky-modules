# Пакет `@sky-modules/math`

## Контекст
Нужна математика Three.js (`src/math`) внутри sky-modules — без зависимости от `three` и с возможностью использовать классы как traits `@sky-modules/core`.

## Цель
Скопировать `src/math` three.js без изменений исходников и дать к нему типы.

## Принципы
- **Без модификаций** — файлы three.js и `@types/three` копируются побайтно.
- **Структура как в three.js** — относительные импорты копий работают без правок.
- **Zero dependencies** — `three` и `@types/three` не нужны.

## Источник
- `three@0.187.0`: `src/math/**/*.js`, `src/constants.js`, `src/utils.js`.
- `@types/three@0.187.0`: `src/math/**/*.d.ts`, `src/constants.d.ts`, `src/utils.d.ts`.
- Лицензии обоих проектов (MIT) — в `packages/math/LICENSE-three.md`.

## Структура
```
packages/math/src/
├── index.ts                  # public API, mirrors math exports of Three.Core.d.ts
├── traits.test.ts
└── three/
    ├── math/**               # copied as is
    ├── constants.js/.d.ts    # copied as is
    ├── utils.js/.d.ts        # copied as is
    ├── core/                 # type-only stubs
    ├── cameras/              # type-only stubs
    └── objects/              # type-only stubs
```

## Заглушки типов
`.d.ts` из math ссылаются на типы вне math. Вместо копирования всего three.js по тем же путям лежат структурные заглушки — только члены, которые читает скопированный JS:

| Файл | Тип | Члены |
|---|---|---|
| `core/BufferAttribute.d.ts` | `BufferAttribute`, `TypedArray` | `count`, `getX/Y/Z/W` |
| `core/InterleavedBufferAttribute.d.ts` | `InterleavedBufferAttribute` | как `BufferAttribute` |
| `core/Object3D.d.ts` | `Object3D` | `matrixWorld`, `children`, `geometry`, bounding box/sphere, `updateWorldMatrix` и др. |
| `cameras/Camera.d.ts` | `Camera` | матрицы, `coordinateSystem`, `reversedDepth` |
| `cameras/ArrayCamera.d.ts` | `ArrayCamera` | `cameras` |
| `objects/Sprite.d.ts` | `Sprite` | `center`, `matrixWorld` |

## Публичный API
`index.ts` повторяет экспорты math из `Three.Core.d.ts`: все классы, `MathUtils`, `ColorManagement`, интерполянты. `constants` и `utils` наружу не отдаются.

## Классы как traits
Проходят `CheckTrait` без изменений: `Box2`, `Box3`, `Color`, `Cylindrical`, `Euler`, `Frustum`, `Line3`, `Matrix3`, `Matrix4`, `Plane`, `Quaternion`, `Ray`, `Sphere`, `Spherical`, `SphericalHarmonics3`, `Triangle`, `Vector2`, `Vector3`, `Vector4`.

Не являются traits:
- `Matrix2` — в three.js 0.187.0 у него нет `copy` и `clone`;
- `FrustumArray`, `Interpolant` и интерполянты, `MathUtils`, `ColorManagement` — не значения с `set`/`copy`/`clone`.

## Ограничения
- Почти все классы three.js имеют общие методы (`equals`, `fromArray`, `toArray`), поэтому два класса three.js в одном `compose` дают конфликт. Практичный сценарий — один класс three.js плюс свои traits.
- Композиция с собственным `set` не является подтипом класса three.js: её нельзя передать туда, где ожидается, например, `Euler`.

## Критерии готовности
- Файлы из three.js и `@types/three` побайтно совпадают с источником.
- `pnpm typecheck` (включая строгую проверку `src/three` с `skipLibCheck: false`), `pnpm test`, `biome check` проходят.
- Тесты: каждый класс-значение проходит `compose`; `Matrix2` отклоняется; вложенное состояние (`Box3`, `Matrix4`) и колбэки (`Euler`) работают внутри композиции.
