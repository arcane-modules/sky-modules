# Миграция на Solid 2: `@sky-modules/jsx` как настоящий Solid universal

## Контекст
`@sky-modules/jsx` назывался «универсальным Solid», но JSX компилировал TypeScript (`react-jsx`): `jsx()` возвращал статический объект `{ type, props }`, выражения вычислялись один раз, реактивности через JSX не было. Рендерер брался из `solid-js/universal` (Solid 1.9).

Solid 2 вышел (`solid-js@2.0.3`). Универсальный рендерер вынесен в `@solidjs/universal`, а реактивный JSX требует компиляции компилятором Solid с `generate: "universal"`.

## Цель
1. `@sky-modules/jsx` — рендерер Solid 2 universal: JSX компилируется в вызовы рендерера и реактивен.
2. Весь репозиторий переходит на `solid-js@2`.
3. Поведение пакета покрыто тестами внутри пакета, включая реактивность.

## Проверенные факты (эксперимент в `/tmp/solid2-lab`)
- `@solidjs/compiler@2.0.2` (нативный, Oxc) с `generate: "universal"` и `moduleName: "@sky-modules/jsx"` превращает JSX в вызовы `createElement`, `insert`, `effect`, `setProp`, `memo`, `createComponent` из `moduleName`. TypeScript-синтаксис сохраняется.
- Статические свойства приходят вторым аргументом: `createElement("text", { value: "positive" })`.
- Встроенные компоненты (`For`, `Show`, `Switch`, `Match`, `Loading`, `Reveal`, `Portal`, `Repeat`, `Dynamic`, `Errored`) импортируются из `moduleName` → пакет обязан их реэкспортировать.
- В Node `solid-js` по условию `node` отдаёт серверную нереактивную сборку. Для реактивности нужно условие `browser`.
- Запись в сигнал применяется к дереву после микрозадачи или явного `flush()`.
- `@solidjs/vite-plugin@3` требует `vite >= 8`; в репозитории `vite@7` и `vitest@3`. Поэтому интеграция — собственный небольшой Vite-плагин поверх `@solidjs/compiler`.

## Решения

### Зависимости `@sky-modules/jsx`
- `peerDependencies`: `solid-js@^2.0.3`.
- `dependencies`: `@solidjs/universal@2.0.3`, `@solidjs/compiler@2.0.2` (точные версии — требование README компилятора).

### Экспорты
| Путь | Содержимое |
|---|---|
| `@sky-modules/jsx` | Результат `createRenderer`: `render`, `effect`, `memo`, `createComponent`, `createElement`, `createTextNode`, `insertNode`, `insert`, `spread`, `setProp`, `mergeProps`, `applyRef`, `ref`; классы узлов и `defineElement`; реэкспорт `solid-js` |
| `@sky-modules/jsx/jsx-runtime`, `/jsx-dev-runtime` | Только типы: пространство имён `JSX` для `jsxImportSource` |
| `@sky-modules/jsx/vite` | `solidUniversal(options?)` — Vite-плагин компиляции |

Удаляются: функции `jsx`/`jsxs`/`jsxDEV`, `Fragment = 'Fragment'`, объекты `{ type, props }`, `ElementType`, старый `EngineElement` (`addJSXChild` без якоря).

### Модель узлов
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

- `disposeJSX` регистрируется в `createElement` через `onCleanup` текущего владельца Solid: ресурсы освобождаются при уничтожении ветки `<Show>`, элемента `<For>` или всего `render`, но не при перемещении узла. Отдельного сигнала «узел удалён навсегда» `@solidjs/universal` не даёт (`cleanupNodes` — только для корня `render`).
- `ref` типизирован бивариантным `JSXRef`, чтобы движки сужали тип узла (`@sky-modules/three`: `ThreeNode<Mesh>`).

- Родителей хранит рендерер (`WeakMap`), а `getFirstChild`/`getNextSibling` вычисляются из `getJSXChildren()`. Движок не может разойтись с рендерером в навигации.
- Перед вставкой узел отцепляется от прежнего места (семантика DOM `insertBefore`).

- `JSXElementNode` — узел по умолчанию: `tag`, `props`, `children`, `parent`.
- `JSXTextNode` — текстовый узел: `value`. Текст отличается по классу, а не по строке `type` (иначе тег `<text>` конфликтует с текстом).
- `defineElement(tag, factory)` — регистрирует фабрику узла движка для тега (`mesh`, `sprite`…). Без фабрики создаётся `JSXElementNode`. Повторная регистрация тега — ошибка.
- `createElement(tag, staticProps)` создаёт узел и применяет статические свойства через `setJSXProperty`.

### Vite-плагин `solidUniversal`
- `enforce: 'pre'`, обрабатывает `.jsx`/`.tsx` (настраиваемые `include`/`exclude`), вне `node_modules`.
- Вызывает `transform(code, { filename, generate: 'universal', moduleName: '@sky-modules/jsx', sourceMap: true })`.
- Добавляет условие `browser` в `resolve.conditions` и в серверное разрешение, чтобы `solid-js` был реактивным в Node (vitest).
- В tsconfig потребителя: `"jsx": "preserve"`, `"jsxImportSource": "@sky-modules/jsx"`.

### Остальные пакеты
- `reactive`: свойства хранятся в ячейках (`internal/cell.ts`). Ячейка держит само значение, а сигнал Solid 2 — только счётчик версий для подписки. Так чтение сразу после записи возвращает новое значение, функции не становятся вычислениями, эффекты получают уведомления пачкой. Сигнал создаётся с `ownedWrite: true`: запись из эффектов разрешена. Тесты `reactive` идут на клиентской сборке `solid-js`.
- `universal`: `solid-js@2`; `Context.Provider` → `<Context value>`; типы JSX — из `@solidjs/web`.
- `router`: тип `RouteComponent = (props) => JSX.Element` вместо удалённого `JSX.FC`.
- `canvas`: `createCanvasObject` работает со своим типом описания `CanvasElement` (`{ type, props }`) и не зависит от JSX `jsx`. Перевод на рендерер Solid (`defineElement`, реактивность) — отдельная задача.
- `three`: свои типы элементов, изменений в коде нет; `jsxImportSource` → `@sky-modules/jsx`.

## Тесты `@sky-modules/jsx` (vitest + `solidUniversal`)
- монтирование дерева и статические свойства;
- реактивное свойство: сигнал → `flush()` → новое значение у узла;
- реактивный текст;
- `<Show>` добавляет и удаляет узлы, `<For>` — элементы списка в правильном порядке;
- компонент с реактивными props;
- `dispose` из `render` очищает дерево;
- `defineElement`: узел движка получает свойства и детей, дубликат тега — ошибка.

## Критерии готовности
- `pnpm -r typecheck`, `pnpm -r test`, `biome check .` проходят.
- Ни один пакет не зависит от `solid-js@1`.
- Документация `jsx` (en/ru) описывает новую настройку.
