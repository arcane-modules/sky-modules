import type { JSX } from '@sky-modules/jsx'
import { type Route, type RouteMatch, UniversalRouter } from '@sky-modules/router'

function requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id)
    if (!element) throw new Error(`Missing element #${id}`)
    return element as T
}

// The playground may live under any path (for example inside the docs site), so routes are relative to it.
const base = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')
window.history.replaceState({}, '', `${base}/`)

function page(text: string): JSX.FC {
    return () => ({ type: 'page', props: { children: text } })
}

const routes: Route[] = [
    { path: `${base}/`, Component: page('Home') },
    { path: `${base}/users/:id`, Component: page('User page') },
    {
        path: `${base}/lazy`,
        Component: async () => {
            await new Promise((resolve) => setTimeout(resolve, 600))
            return page('Lazy page, loaded after 600 ms')
        },
    },
]

const router = new UniversalRouter(routes, { notFound: page('Not found'), loading: page('Loading...') })

const viewElement = requireElement<HTMLPreElement>('view')
const matchElement = requireElement<HTMLPreElement>('match')

function show(match: RouteMatch | null): void {
    if (!match) {
        viewElement.textContent = '(no match)'
        matchElement.textContent = ''
        return
    }

    viewElement.textContent = JSON.stringify(match.Component({}), null, 2)
    matchElement.textContent = JSON.stringify(
        { path: match.path.replace(base, '') || '/', params: match.params, isLoading: match.isLoading ?? false },
        null,
        2
    )
}

router.subscribe(show)
show(router.getCurrentMatch())

const links: Array<[label: string, path: string]> = [
    ['Home', '/'],
    ['User 42', '/users/42'],
    ['User 7', '/users/7'],
    ['Lazy', '/lazy'],
    ['Missing', '/missing'],
]

const nav = requireElement<HTMLElement>('nav')
for (const [label, path] of links) {
    const button = document.createElement('button')
    button.textContent = label
    button.addEventListener('click', () => router.navigate(`${base}${path}`))
    nav.appendChild(button)
}
