# Портирование router, canvas и three на @sky-modules/jsx

## Контекст

В старом проекте (`/inbox`) существуют:
- `platform/universal/router/UniversalRouter.ts` — универсальный клиентский роутер
- `canvas/` — 2D Canvas renderer с JSX, Box-рендерингом, геометриями, материалами
- `three/jsx.tsx` — Three.js JSX renderer

Эти модули были основаны на `sky-jsx`. Теперь, когда создан `@sky-modules/jsx`, нужно перенести их в новый монорепозиторий и адаптировать под `@sky-modules/jsx`.

## Цель

Создать три новых пакета в новом проекте:
1. `@sky-modules/router` — универсальный роутер на основе `@sky-modules/jsx`
2. `@sky-modules/canvas` — 2D Canvas JSX renderer на основе `@sky-modules/jsx`
3. `@sky-modules/three` — Three.js JSX renderer на основе `@sky-modules/jsx`

## Что изменится

### Phase 1: Router
1. Создать `packages/router/`
2. Перенести `UniversalRouter.ts` и тесты
3. Адаптировать типы JSX под `@sky-modules/jsx`
4. Создать пример использования

### Phase 2: Canvas (минимальный viable пакет)
1. Создать `packages/canvas/`
2. Перенести базовый `CanvasRenderer` и `Scene`/`Mesh`/`Object2D`
3. Создать JSX-рендерер для canvas на основе `@sky-modules/jsx/jsx-universal`
4. Перенести базовые geometries (Rect, Circle) и materials
5. Создать тесты

### Phase 3: Three.js JSX renderer
1. Создать `packages/three/`
2. Перенести `ThreeJSXRenderer`
3. Адаптировать под `@sky-modules/jsx`
4. Создать тесты

## Детали реализации

### @sky-modules/router

```
packages/router/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── UniversalRouter.ts
    └── UniversalRouter.test.ts
```

**API:**
- `UniversalRouter` — класс роутера
- `Route`, `RouteMatch`, `ScreenModule`, `PageRoute` — типы
- `createRoutesFromScreens(screens)` — конвертация файловых экранов в роуты

**Зависимости:**
- peer: `@sky-modules/jsx`
- dev: `typescript`, `vitest`

### @sky-modules/canvas

```
packages/canvas/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── core/
    │   ├── CanvasRenderer.ts
    │   ├── Scene.ts
    │   ├── Mesh.ts
    │   ├── Object2D.ts
    │   └── Group.ts
    ├── geometries/
    │   ├── Geometry.ts
    │   ├── RectGeometry.ts
    │   └── CircleGeometry.ts
    ├── materials/
    │   ├── Material.ts
    │   ├── BasicMaterial.ts
    │   └── FillStrokeMaterial.ts
    └── jsx/
        ├── canvas-renderer.ts
        └── index.ts
```

**API:**
- `CanvasRenderer` — 2D canvas wrapper
- `Scene`, `Mesh`, `Group`, `Object2D` — scene graph
- `RectGeometry`, `CircleGeometry` — базовые геометрии
- `BasicMaterial`, `FillStrokeMaterial` — базовые материалы
- JSX renderer для canvas

**Зависимости:**
- peer: `@sky-modules/jsx`
- dev: `typescript`, `vitest`

### @sky-modules/three

```
packages/three/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    └── jsx/
        ├── ThreeJSXRenderer.ts
        └── ThreeJSXRenderer.test.ts
```

**API:**
- `ThreeJSXRenderer` — JSX-based Three.js renderer
- Поддержка intrinsic elements: `scene`, `mesh`, `group`, `camera`, lights, geometries, materials

**Зависимости:**
- peer: `@sky-modules/jsx`, `three`
- dev: `typescript`, `vitest`, `@types/three`

## Критерии приёмки

- [x] `@sky-modules/router` создан и проходит typecheck
- [x] `@sky-modules/router` имеет тесты для базовых сценариев
- [x] `@sky-modules/canvas` создан и проходит typecheck
- [x] `@sky-modules/canvas` имеет базовые тесты
- [x] `@sky-modules/three` создан и проходит typecheck
- [x] `@sky-modules/three` имеет базовые тесты
- [x] Все пакеты интегрированы с `@sky-modules/jsx`
- [x] `pnpm run typecheck` проходит для всех пакетов
- [x] `pnpm run test` проходит для всех пакетов
- [x] Examples обновлены с новыми пакетами
