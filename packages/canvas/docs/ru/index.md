# @sky-modules/canvas

Небольшой 2D-граф сцены на canvas с геометриями, материалами и необязательным JSX-фронтендом. Словарь взят из Three.js: сцена, меш, геометрия, материал, рендерер. `@sky-modules/jsx` — peer-зависимость.

## Быстрый старт

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

## Ядро

### `CanvasRenderer`

| Член | Описание |
| --- | --- |
| `new CanvasRenderer({ canvas?, size, pixelRatio? })` | Использует переданный canvas или создаёт свой. `size()` возвращает `[width, height]`. Выбрасывает ошибку, если нет canvas, `document` или 2D-контекста. |
| `domElement`, `drawContext`, `pixelRatio` | Canvas, его 2D-контекст и коэффициент пикселей (по умолчанию `1`). |
| `onResize()` | Применяет текущий размер и коэффициент пикселей. |
| `clear()` | Очищает canvas. |
| `render(scene)` | Меняет размер, очищает, рисует `scene.background` и рендерит всех потомков. |

### `Object2D`

Базовый класс узла. Поля: `x`, `y`, `rotation` (радианы), `scaleX`, `scaleY`, `visible`, `parent`, `children`. Методы: `add(child)`, `remove(child)`, `getTransform()`, `render(ctx)` (применяет перенос, поворот, масштаб, вызывает `draw`, рендерит потомков) и `draw(ctx)`, который переопределяют подклассы.

### `Scene`, `Group`, `Mesh`

- `Scene` — корень, у неё есть необязательный цвет `background`.
- `Group` — пустой контейнер.
- `Mesh(geometry, material)` применяет материал, затем рисует геометрию.

## Геометрии

Геометрия реализует `draw(ctx)`.

| Класс | Параметры |
| --- | --- |
| `RectGeometry` | `width`, `height`, `x?`, `y?`, `radius?` (скруглённые углы) |
| `CircleGeometry` | `radius`, `x?`, `y?` |

## Материалы

Материал реализует `apply(ctx)`.

| Класс | Параметры |
| --- | --- |
| `BasicMaterial` | `color` (заливка) |
| `FillStrokeMaterial` | `fill?`, `stroke?`, `strokeWidth?` (по умолчанию `1`) |

## JSX

`createCanvasObject(element)` преобразует JSX-элемент в объекты сцены и возвращает `null` для неизвестных тегов.

| Тег | Props |
| --- | --- |
| `rect` | `width`, `height`, `radius`, `fill`, `stroke`, `strokeWidth` |
| `circle` | `radius`, `fill`, `stroke`, `strokeWidth` |
| `group` | нет |

Все теги также принимают `x`, `y`, `rotation`, `scaleX`, `scaleY`, `visible` и вложенных потомков. Функциональные компоненты вызываются, их результат преобразуется. Фигура со `stroke` использует `FillStrokeMaterial`, иначе `BasicMaterial` (заливка по умолчанию `#000000`).

## Типы

`CanvasRendererParameters`, `Transform2D`, `Geometry`, `Material`, `RectGeometryParameters`, `CircleGeometryParameters`, `BasicMaterialParameters`, `FillStrokeMaterialParameters`, `CanvasJSXNode`.

## Playground

<Playground name="canvas" />
