# Arbor runtime

## Контекст
В новом проекте `/Users/a/Space/Projects/ArcaneModules/sky-modules/arbor` нужно реализовать систему Arbor с нуля. Она заменяет идею `effect`: управляемое владение ресурсами, контролируемое разрушение, контексты и dispatch событий по дереву. API должен быть чистым, без совместимости с `Effect`.

## Цель
Создать TypeScript-пакет `arbor` с корнем `ArborTree` и нодами `ArborNode`, который обеспечивает runtime-ownership, lifecycle cleanup, scoped contexts, dispatch событий по дереву и IO-регистрацию событий браузера/кадров.

## Что изменится
1. `arbor/package.json` — описание пакета, exports, scripts.
2. `arbor/tsconfig.json` — строгая TypeScript-конфигурация.
3. `arbor/src/index.ts` — публичный API.
4. `arbor/src/ArborTree.ts` — корень дерева, очереди операций, IO hooks.
5. `arbor/src/ArborNode.ts` — нода владения, parents/children/dependencies/context/lifecycle.
6. `arbor/src/ArborContext.ts` — типы контекстов.
7. `arbor/src/ArborEvent.ts` — типы и dispatch событий.
8. `arbor/src/ArborDependency.ts` — типы зависимостей.
9. `arbor/src/internal/*` — внутренние типы, операции и helpers.
10. `arbor/src/__spec__/*` — unit-тесты lifecycle/context/events/IO.
11. `arbor/README.md` и `arbor/README.ru.md` — краткая документация.

## Детали реализации
1. `ArborTree`:
   - является корнем дерева;
   - хранит pending-очереди операций;
   - метод `commit(): void` атомарно применяет операции и очищает очереди;
   - метод `dispose(): Promise<void>` разрушает всё дерево;
   - предоставляет IO-регистрацию: update/render/window resize/mouse/keyboard/gamepad;
   - не использует браузерные API на сервере без проверки доступности.

2. `ArborNode`:
   - создаётся только с owner/dependency: `new ArborNode(treeOrNode, host?)` или `new ArborNode(setup, treeOrNode, host?)`;
   - `setup` возвращает destructor `() => void | Promise<void>`;
   - поддерживает `addParent`, `removeParent`, `addDependency`, `removeDependency`;
   - последний owner уничтожает ноду;
   - disposed-ноду нельзя повторно разрушить или подключить;
   - destruction идёт children-first, затем собственный destructor.

3. Context:
   - контекст задаётся классом со `static context = true`;
   - `addContext(context)` добавляет контекст именно на target-ноду/дерево;
   - дочерние ноды видят контексты родителей;
   - `context(Context)` возвращает значение или бросает понятную ошибку;
   - `maybeContext(Context)` возвращает значение или `undefined`;
   - при удалении контекста вызываются cleanup-эффекты, созданные context hooks.

4. Events:
   - `dispatch(eventName, event)` идёт сверху вниз;
   - `dispatchReverse(eventName, event)` идёт снизу вверх в обратном порядке детей;
   - host получает методы с именем события;
   - event поддерживает `isCaptured`;
   - dispatch не падает на отсутствующих handlers.

5. IO:
   - update/render работают через `requestAnimationFrame` в браузере и через timer fallback вне браузера;
   - mouse/keyboard/window/gamepad регистрируются только если `window`/`navigator` доступны;
   - все IO listeners снимаются при `dispose()` дерева;
   - input state хранится в `ArborTree`.

6. Типизация:
   - без `any` в публичном API;
   - generic context helpers;
   - файлы заканчиваются переводом строки;
   - комментарии в коде только на английском.

## Критерии приёмки
- [ ] Пакет `arbor` создаётся с чистым API `ArborTree`, `ArborNode`, `ArborContext`, `ArborDependency`.
- [ ] Parent-child владение работает: dispose родителя уничтожает детей children-first.
- [ ] Multi-parent нода живёт, пока есть хотя бы один owner.
- [ ] Pending-операции применяются через `commit()` и не повторяются при следующем `commit()`.
- [ ] Context добавляется на конкретный target и распространяется только вниз.
- [ ] Context hooks на host вызываются и их cleanup выполняется при удалении context/dispose.
- [ ] `dispatch` и `dispatchReverse` доставляют события в правильном порядке.
- [ ] IO hooks регистрируются безопасно и очищаются при dispose.
- [ ] Unit-тесты покрывают lifecycle/context/events/IO cleanup.
- [ ] `pnpm test`, `pnpm lint`, `pnpm typecheck` проходят без ошибок.
