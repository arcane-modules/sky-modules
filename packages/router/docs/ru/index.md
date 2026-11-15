# @sky-modules/router

Универсальный клиентский роутер для JSX-компонентов. Зависит от `@sky-modules/jsx` (peer-зависимость) ради типа компонента и использует History API в браузере.

## Быстрый старт

```ts
import { UniversalRouter } from '@sky-modules/router'

const router = new UniversalRouter(
    [
        { path: '/', Component: HomePage },
        { path: '/users/:id', Component: UserPage },
    ],
    { notFound: NotFoundPage, loading: LoadingPage }
)

const unsubscribe = router.subscribe((match) => {
    console.log(match?.path, match?.params)
})

router.navigate('/users/123')
```

## Маршруты

```ts
interface Route {
    path: string // '/users/:id'
    Component: JSX.FC | (() => Promise<JSX.FC>) // компонент или ленивый загрузчик
}
```

- Сегмент `:name` совпадает с одним сегментом пути (без слэшей) и попадает в `params`.
- Побеждает первый подходящий маршрут в списке.
- Ленивый `Component` (функция, возвращающая промис) загружается при первом совпадении и кэшируется.
- С компонентом `loading` роутер сначала возвращает его (`isLoading: true`) и повторно уведомляет подписчиков, когда ленивый компонент готов. Без него навигация ждёт компонент.
- Если ни один маршрут не подошёл, используется `notFound`. Без него совпадение равно `null`.

## `UniversalRouter`

| Член | Описание |
| --- | --- |
| `new UniversalRouter(routes, options?)` | Сопоставляет текущий `location.pathname` и слушает `popstate`. Опции: `notFound`, `loading`. |
| `navigate(path)` | `history.pushState` и повторное сопоставление. |
| `getCurrentMatch()` | Текущий `RouteMatch` или `null`. |
| `subscribe(listener)` | Вызывается при смене пути маршрута или параметров. Возвращает функцию отписки. |
| `destroy()` | Снимает слушатель `popstate`, очищает слушателей и кэш. |

`RouteMatch` содержит `path`, `params`, `Component` и `isLoading`.

Вне браузера (`window` не определён) роутер сопоставляет `/`, а `navigate` лишь пересопоставляет.

## Файловая маршрутизация

`createRoutesFromScreens(screens)` строит маршруты из одного из вариантов:

- объект модулей (например, результат `import.meta.glob('./screens/**/*.tsx')` с экспортом `default`). Имена файлов становятся путями: `./users/[id].tsx` превращается в `/users/:id`, `index` — в `/`.
- массив объектов `PageRoute` (`{ name, path, component }`) из плагинов вроде `vite-plugin-pages`.

Результат отсортирован: статические маршруты идут перед динамическими, а более глубокие пути — перед менее глубокими.

## Типы

`Route`, `RouteMatch`, `ScreenModule`, `PageRoute`.

## Playground

<Playground name="router" />
