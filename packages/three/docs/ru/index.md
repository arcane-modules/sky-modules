# @sky-modules/three

Рендерер Three.js, управляемый объектами-элементами в стиле JSX. Peer-зависимости: `@sky-modules/jsx` и `three` (^0.160).

## Быстрый старт

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

| Член | Описание |
| --- | --- |
| `new ThreeJSXRenderer(container?)` | Создаёт сцену, перспективную камеру (75°, позиция `5, 5, 5`, смотрит в начало координат) и часы. В браузере также создаёт `WebGLRenderer` и добавляет его canvas в `container`. |
| `render(element \| elements)` | Очищает сцену, пересобирает её из элементов, затем рендерит один кадр. |
| `dispose()` | Удаляет объекты, освобождает геометрии и материалы, освобождает WebGL-рендерер. |
| `scene`, `camera`, `renderer`, `clock` | Базовые объекты Three.js. |

Вне браузера `WebGLRenderer` не создаётся, поэтому сцену можно использовать в тестах.

## Элементы

| Элемент | Props |
| --- | --- |
| `scene` | `background`, `fog` (только тип) |
| `camera` | `position`, `rotation`, `lookAt`, `fov`, `aspect`, `near`, `far` (изменяет камеру рендерера) |
| `ambientLight` | `color`, `intensity` |
| `directionalLight` | `color`, `intensity`, `position`, `castShadow` |
| `pointLight` | `color`, `intensity`, `position`, `distance`, `decay` |
| `mesh` | `position`, `rotation`, `scale`, `visible`, `castShadow`, `receiveShadow`, `onUpdate` (рендерер сохраняет, но пока не вызывает: цикла анимации нет) |
| `group` | `position`, `rotation`, `scale`, `visible` |
| `boxGeometry` | `args`, по умолчанию `[1, 1, 1]` |
| `sphereGeometry` | `args`, по умолчанию `[1, 8, 6]` |
| `meshBasicMaterial` | `color` |
| `meshStandardMaterial` | `color`, `metalness` (по умолчанию `0`), `roughness` (по умолчанию `1`) |

Векторы — кортежи `[x, y, z]`. Геометрии и материалы — потомки `mesh`. Неизвестные типы элементов игнорируются.

Типы `JSX.IntrinsicElements` для этих элементов объявляются глобально при импорте пакета.

## Playground

<Playground name="three" />
