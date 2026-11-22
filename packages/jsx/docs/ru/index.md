# @sky-modules/jsx

Рендерер Solid 2 universal: реактивный JSX для любого графа сцены (canvas, three, ваш движок) вместо DOM.

JSX компилирует `@solidjs/compiler` в режиме `universal`. Выражения в JSX становятся точечными реактивными связями: изменился сигнал — обновилось только одно свойство узла.

`solid-js@2` — peer-зависимость.

## Настройка

`vite.config.ts`:

```ts
import { solidUniversal } from '@sky-modules/jsx/vite'

export default { plugins: [solidUniversal()] }
```

Плагин компилирует `.jsx`/`.tsx` (кроме `node_modules`) и добавляет условие `browser`: иначе в Node `solid-js` отдаёт серверную нереактивную сборку. Плагин работает с Vite 7 и Vitest 3.

`tsconfig.json`:

```json
{
    "compilerOptions": {
        "jsx": "preserve",
        "jsxImportSource": "@sky-modules/jsx"
    }
}
```

## Быстрый старт

```tsx
import { createSignal, flush, JSXElementNode, render, Show } from '@sky-modules/jsx'

const [count, setCount] = createSignal(0)
const root = new JSXElementNode('root')

const dispose = render(
    () => (
        <counter value={count()}>
            <Show when={count() > 0}>
                <badge kind="positive" />
            </Show>
        </counter>
    ),
    root
)

setCount(1)
flush() // Solid 2 applies writes after a microtask; flush() applies them now
```

## Узлы

Рендерер работает с интерфейсом `JSXNode`:

```ts
interface JSXNode {
    setJSXProperty(name: string, value: unknown, prev: unknown): void
    insertJSXChild(child: JSXNode, anchor: JSXNode | undefined): void
    removeJSXChild(child: JSXNode): void
    getJSXChildren(): readonly JSXNode[]
    disposeJSX?(): void
}
```

- `JSXElementNode` — узел по умолчанию: `tag`, `props`, `children`.
- `JSXTextNode` — текст (`value`). Отличается по классу, поэтому тег `<text>` с ним не конфликтует.
- Родителя узла хранит рендерер. Перед вставкой узел отцепляется от прежнего места, как в DOM `insertBefore`.
- `disposeJSX` (необязательный) освобождает ресурсы движка. Вызывается один раз, когда Solid уничтожает владельца, создавшего узел: ветку `<Show>`, элемент `<For>` или весь `render`. Перемещение узла его не вызывает.
- `ref` получает узел. Тип `JSXRef` бивариантный, поэтому движок может сузить тип узла в своих тегах.

### Узлы движка

`defineElement(tag, factory)` регистрирует фабрику для тега. Теги без фабрики создают `JSXElementNode`. Повторная регистрация тега — ошибка.

```ts
defineElement('sprite', () => new SpriteNode())
```

Статические свойства из JSX применяются через `setJSXProperty` сразу после создания узла.

## Экспорты

- Функции рендерера, которые вызывает скомпилированный JSX: `render`, `effect`, `memo`, `createComponent`, `createElement`, `createTextNode`, `insertNode`, `insert`, `spread`, `setProp`, `mergeProps`, `applyRef`, `ref`.
- `JSXNode`, `JSXElementNode`, `JSXTextNode`, `defineElement`, `createNode`.
- Всё из `solid-js` (`createSignal`, `flush`, `For`, `Show`…): компилятор импортирует встроенные компоненты из `@sky-modules/jsx`.
- Типы: `JSX`, `IntrinsicProps`.

## Playground

<Playground name="jsx" />
