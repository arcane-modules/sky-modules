# @sky-modules/jsx

Универсальный JSX-рантайм на основе SolidJS. Реэкспортирует `solid-js`, даёт фабричные функции JSX и собственный рендерер Solid, который может управлять любым графом сцены (canvas, three, ваш движок) вместо DOM.

`solid-js` — peer-зависимость.

## Настройка TypeScript

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@sky-modules/jsx"
    }
}
```

Пакет экспортирует `jsx`, `jsxs` (продакшен), `jsxDEV` (разработка) и пространство имён `JSX` через подпути `@sky-modules/jsx/jsx-runtime` и `@sky-modules/jsx/jsx-dev-runtime`.

## Что создаёт JSX

`jsx(type, props)` возвращает простой объект `{ type, props }`. При создании никакой работы не выполняется: смысл объекта определяет рендерер.

```tsx
// <box x={10}>Hello</box>
jsx('box', { x: 10, children: 'Hello' })
```

`Fragment` — строка `'Fragment'`.

## Типы JSX

`JSX.FC<P>` — тип функционального компонента. `JSX.Element` — `{ type, props, children? }`, `JSX.Node` охватывает элементы, текстовые узлы, массивы, строки, числа, булевы значения, `null` и `undefined`. Встроенные элементы принимают любой тег.

## Универсальный рендерер

`@sky-modules/jsx/jsx-universal` создаёт рендерер Solid (`createRenderer`) со следующими экспортами:

`render`, `effect`, `memo`, `createElement`, `createTextNode`, `insert`, `spread`, `setProp`, `mergeProps`, `createComponent`. Корневой пакет тоже их реэкспортирует.

Элементы — простые объекты `{ type, props }`, текст — `{ type: 'text', value }`. Функциональные компоненты вызываются напрямую с их props.

### Элементы движка

Чтобы узел вашего движка стал частью JSX-дерева, реализуйте `EngineElement`:

```ts
interface EngineElement {
    setJSXProperty(name: string, value: unknown): void
    addJSXChild(child: unknown): void
    removeJSXChild(child: unknown): void
    getJSXParent(): EngineElement | null
    getJSXFirstChild(): EngineElement | null
    getJSXNextSibling(): EngineElement | null
}
```

Когда рендерер встречает объект со всеми шестью методами, он вызывает их вместо изменения `props`.

## Связанные пакеты

Типы JSX используют `@sky-modules/canvas`, `@sky-modules/three` и `@sky-modules/router`.

## Playground

<Playground name="jsx" />
