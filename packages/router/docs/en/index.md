# @sky-modules/router

A universal client-side router for JSX components. It depends on `@sky-modules/jsx` (peer dependency) for the component type and uses the History API in a browser.

## Quick start

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

## Routes

```ts
interface Route {
    path: string // '/users/:id'
    Component: JSX.FC | (() => Promise<JSX.FC>) // component or lazy loader
}
```

- A `:name` segment matches one path segment (no slashes) and appears in `params`.
- The first matching route in the list wins.
- A lazy `Component` (a function returning a promise) is loaded on first match and cached.
- With a `loading` component, the router returns it first (`isLoading: true`) and notifies subscribers again when the lazy component is ready. Without it, navigation waits for the component.
- When no route matches, `notFound` is used. Without it the match is `null`.

## `UniversalRouter`

| Member | Description |
| --- | --- |
| `new UniversalRouter(routes, options?)` | Matches the current `location.pathname` and listens to `popstate`. Options: `notFound`, `loading`. |
| `navigate(path)` | `history.pushState` and re-match. |
| `getCurrentMatch()` | Current `RouteMatch` or `null`. |
| `subscribe(listener)` | Called when the route path or params change. Returns an unsubscribe function. |
| `destroy()` | Removes the `popstate` listener, clears listeners and cache. |

`RouteMatch` contains `path`, `params`, `Component` and `isLoading`.

Outside a browser (`window` is undefined) the router matches `/` and `navigate` only re-matches.

## File-based routing

`createRoutesFromScreens(screens)` builds routes from either:

- an object of modules (for example `import.meta.glob('./screens/**/*.tsx')` results with a `default` export). File names become paths: `./users/[id].tsx` becomes `/users/:id`, `index` becomes `/`.
- an array of `PageRoute` objects (`{ name, path, component }`) from plugins such as `vite-plugin-pages`.

The result is sorted so that static routes come before dynamic ones, and deeper paths before shallower ones.

## Types

`Route`, `RouteMatch`, `ScreenModule`, `PageRoute`.

## Playground

<Playground name="router" />
