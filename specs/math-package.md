# Выделение math из three.js в @sky-modules/math

## Контекст

В старом проекте (`/inbox`) math-функции были встроены в `three/`. Для canvas (2D), three (3D) и потенциально других пакетов (physics, animation) нужны базовые математические классы:
- `Vector2`, `Vector3` — векторы
- `Matrix3`, `Matrix4` — матрицы
- `Quaternion` — кватернионы
- `Euler` — углы Эйлера

Three.js предоставляет свои собственные math-классы, но они привязаны к рендереру. Выделение math в отдельный пакет:
- Позволяет использовать math независимо (в canvas, animation, physics)
- Уменьшает связность
- Облегчает тестирование
- Поддерживает fallback на нативные типы (Float32Array)

## Цель

Создать `@sky-modules/math` — независимый пакет с базовыми math-классами, который:
1. Реализует Vector2, Vector3, Matrix4, Quaternion, Euler
2. Не зависит от three.js (но может использоваться вместе)
3. Может быть использован в canvas, three и будущих пакетах
4. Имеет полное покрытие тестами

## Что изменится

### Phase 1: Создание math пакета
1. `packages/math/` — новый пакет
2. `packages/math/src/Vector2.ts`
3. `packages/math/src/Vector3.ts`
4. `packages/math/src/Matrix4.ts`
5. `packages/math/src/Quaternion.ts`
6. `packages/math/src/Euler.ts`
7. `packages/math/src/index.ts`
8. `packages/math/src/*.test.ts` — тесты

### Phase 2: Интеграция с three
1. `packages/three/src/ThreeJSXRenderer.ts` — использовать `@sky-modules/math` где возможно
2. Оставить three.js для WebGLRenderer, Scene, Mesh (зависит от рендера)

### Phase 3: Документация
1. Обновить `docs/API.md` с разделом math
2. Обновить `README.md` с новым пакетом
3. Создать пример `examples/math.ts`

## Детали реализации

### Vector2

```typescript
export class Vector2 {
    constructor(x: number = 0, y: number = 0)
    
    x: number
    y: number
    
    set(x: number, y: number): this
    copy(v: Vector2): this
    clone(): Vector2
    
    add(v: Vector2): this
    sub(v: Vector2): this
    multiply(v: Vector2): this
    divide(v: Vector2): this
    
    dot(v: Vector2): number
    length(): number
    normalize(): this
    
    distanceTo(v: Vector2): number
}
```

### Vector3

```typescript
export class Vector3 {
    constructor(x: number = 0, y: number = 0, z: number = 0)
    
    x: number
    y: number
    z: number
    
    set(x: number, y: number, z: number): this
    copy(v: Vector3): this
    clone(): Vector3
    
    add(v: Vector3): this
    sub(v: Vector3): this
    multiply(v: Vector3): this
    divide(v: Vector3): this
    
    dot(v: Vector3): number
    cross(v: Vector3): this
    length(): number
    normalize(): this
    
    distanceTo(v: Vector3): number
    
    applyMatrix4(m: Matrix4): this
}
```

### Matrix4

```typescript
export class Matrix4 {
    elements: Float32Array // 16 elements
    
    constructor()
    
    set(...values: number[]): this
    identity(): this
    copy(m: Matrix4): this
    clone(): Matrix4
    
    multiply(m: Matrix4): this
    invert(): this
    transpose(): this
    
    makeTranslation(x: number, y: number, z: number): this
    makeRotationX(theta: number): this
    makeRotationY(theta: number): this
    makeRotationZ(theta: number): this
    makeScale(x: number, y: number, z: number): this
    
    getPosition(): Vector3
}
```

### Quaternion

```typescript
export class Quaternion {
    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1)
    
    x: number
    y: number
    z: number
    w: number
    
    set(x: number, y: number, z: number, w: number): this
    copy(q: Quaternion): this
    clone(): Quaternion
    
    multiply(q: Quaternion): this
    normalize(): this
    conjugate(): this
    invert(): this
    
    setFromAxisAngle(axis: Vector3, angle: number): this
    setFromEuler(euler: Euler): this
}
```

### Euler

```typescript
export enum EulerOrder {
    XYZ, YXZ, ZXY, ZYX, XZY, YZX
}

export class Euler {
    constructor(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = EulerOrder.XYZ)
    
    x: number
    y: number
    z: number
    order: EulerOrder
    
    set(x: number, y: number, z: number, order?: EulerOrder): this
    copy(e: Euler): this
    clone(): Euler
}
```

## Критерии приёмки

- [ ] `packages/math` создан с типами и тестами
- [ ] Vector2, Vector3, Matrix4, Quaternion, Euler реализованы
- [ ] Все math-классы имеют unit-тесты (>= 30 тестов)
- [ ] `pnpm run typecheck` проходит
- [ ] `pnpm run test` проходит
- [ ] `docs/API.md` обновлён
- [ ] `README.md` обновлён
- [ ] Пример `examples/math.ts` создан