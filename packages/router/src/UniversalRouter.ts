/**
 * Universal Router
 *
 * Client-side routing for cross-platform applications.
 * Works with any JSX-based framework via @sky-modules/jsx.
 *
 * @module
 */

import type { JSX } from '@sky-modules/jsx'

/**
 * Matched route with resolved component and extracted params.
 *
 * @global
 */
export interface RouteMatch {
    /** Matched route path pattern. */
    path: string
    /** Extracted URL parameters from dynamic segments. */
    params: Record<string, string>
    /** Resolved component. */
    Component: JSX.FC
    /** Whether component is still loading (lazy loaded). */
    isLoading?: boolean
}

/**
 * Route definition with path pattern and component.
 *
 * @global
 */
export interface Route {
    /** Route path pattern (e.g., '/users/:id'). */
    path: string
    /** Component or lazy-loaded component factory. */
    Component: JSX.FC | (() => Promise<JSX.FC>)
}

/**
 * Screen module with default export (component or lazy component).
 *
 * @global
 */
export interface ScreenModule {
    default: JSX.FC | (() => Promise<JSX.FC>)
}

/**
 * Page route from file-based routing plugins (vite-plugin-pages, etc.).
 *
 * @global
 */
export interface PageRoute {
    /** Route name identifier. */
    name: string
    /** Route path pattern. */
    path: string
    /** Component or lazy-loaded component. */
    component: JSX.FC | (() => Promise<JSX.FC>)
    /** Whether route accepts props. */
    props?: boolean
}

/**
 * Shallow equality check for params objects.
 */
function shallowEqual(a: Record<string, string> | undefined, b: Record<string, string> | undefined): boolean {
    if (a === b) return true
    if (!a || !b) return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
        if (a[key] !== b[key]) return false
    }

    return true
}

/**
 * Universal Router - client-side routing for cross-platform applications.
 *
 * @global
 * @example
 * ```ts
 * const router = new UniversalRouter([
 *   { path: '/', Component: HomePage },
 *   { path: '/users/:id', Component: UserPage },
 * ], {
 *   notFound: NotFoundPage,
 *   loading: LoadingPage,
 * })
 *
 * router.subscribe(match => {
 *   console.log('Route changed:', match)
 * })
 *
 * router.navigate('/users/123')
 * ```
 */
export class UniversalRouter {
    private routes: Route[] = []
    private currentMatch: RouteMatch | null = null
    private listeners: Set<(match: RouteMatch | null) => void> = new Set()
    private notFoundComponent: JSX.FC | null = null
    private loadingComponent: JSX.FC | null = null
    private loadedComponents = new Map<string, JSX.FC>()
    private popstateHandler = (): void => {
        this.handleLocationChange().catch((error) => {
            console.error('[UniversalRouter] Navigation error:', error)
        })
    }

    /**
     * Creates a new router instance.
     *
     * @param routes - Route definitions.
     * @param options - Router options (notFound, loading).
     */
    constructor(routes: Route[], options?: { notFound?: JSX.FC; loading?: JSX.FC }) {
        this.routes = routes
        this.notFoundComponent = options?.notFound ?? null
        this.loadingComponent = options?.loading ?? null
        this.handleLocationChange()

        if (typeof window !== 'undefined') {
            window.addEventListener('popstate', this.popstateHandler)
        }
    }

    /**
     * Clean up resources and remove event listeners.
     */
    destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('popstate', this.popstateHandler)
        }
        this.listeners.clear()
        this.loadedComponents.clear()
        this.currentMatch = null
    }

    /**
     * Navigate to a new path.
     *
     * @param path - Target path.
     */
    navigate(path: string): void {
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', path)
        }
        this.handleLocationChange()
    }

    /**
     * Get current route match.
     *
     * @returns Current match or null.
     */
    getCurrentMatch(): RouteMatch | null {
        return this.currentMatch
    }

    /**
     * Subscribe to route changes.
     *
     * @param listener - Callback called on route changes.
     * @returns Unsubscribe function.
     */
    subscribe(listener: (match: RouteMatch | null) => void): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private async handleLocationChange(): Promise<void> {
        const path = typeof window !== 'undefined' ? window.location.pathname : '/'
        const match = await this.matchRoute(path)

        const hasChanged =
            match?.path !== this.currentMatch?.path || !shallowEqual(match?.params, this.currentMatch?.params)

        if (hasChanged) {
            this.currentMatch = match
            this.notifyListeners()
        }
    }

    private async matchRoute(pathname: string): Promise<RouteMatch | null> {
        for (const route of this.routes) {
            const match = this.matchPath(route.path, pathname)

            if (match) {
                const component = await this.loadComponent(route)
                const isLoading = component === this.loadingComponent
                return {
                    path: route.path,
                    params: match.params,
                    Component: component,
                    isLoading,
                }
            }
        }

        if (this.notFoundComponent) {
            return {
                path: pathname,
                params: {},
                Component: this.notFoundComponent,
            }
        }

        return null
    }

    private async loadComponent(route: Route): Promise<JSX.FC> {
        const cached = this.loadedComponents.get(route.path)
        if (cached) return cached

        let isLazyComponent = false
        let loadPromise: Promise<JSX.FC> | null = null

        try {
            const result = (route.Component as () => Promise<JSX.FC>)()
            isLazyComponent = result instanceof Promise

            if (isLazyComponent) {
                loadPromise = result
            }
        } catch {
            isLazyComponent = false
        }

        if (isLazyComponent && loadPromise) {
            if (this.loadingComponent) {
                loadPromise
                    .then((component) => {
                        this.loadedComponents.set(route.path, component)
                        if (this.currentMatch?.path === route.path && this.currentMatch.isLoading) {
                            this.currentMatch = {
                                ...this.currentMatch,
                                Component: component,
                                isLoading: false,
                            }
                            this.notifyListeners()
                        }
                    })
                    .catch((error) => {
                        console.error(`Failed to load component for route ${route.path}:`, error)
                    })

                return this.loadingComponent
            }

            try {
                const component = await loadPromise
                this.loadedComponents.set(route.path, component)
                return component
            } catch (error) {
                console.error(`Failed to load component for route ${route.path}:`, error)

                if (this.notFoundComponent) {
                    return this.notFoundComponent
                }

                throw new Error(`Failed to load component for route "${route.path}" and no fallback available`)
            }
        }

        const component = route.Component as JSX.FC
        this.loadedComponents.set(route.path, component)
        return component
    }

    private matchPath(routePath: string, pathname: string): { params: Record<string, string> } | null {
        const paramNames: string[] = []
        const pattern = routePath.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, paramName) => {
            paramNames.push(paramName)
            return '([^\\/]+)'
        })

        const regex = new RegExp(`^${pattern}$`)
        const match = pathname.match(regex)

        if (!match) return null

        const params: Record<string, string> = {}
        for (let index = 0; index < paramNames.length; index++) {
            const name = paramNames[index]
            const value = match[index + 1]
            if (name && value !== undefined) {
                params[name] = value
            }
        }

        return { params }
    }

    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.currentMatch)
        }
    }
}

/**
 * Create routes from screen files or vite-plugin-pages output.
 *
 * @global
 * @param screens - Screen modules or vite-plugin-pages routes.
 * @returns Sorted array of routes.
 */
export function createRoutesFromScreens(screens: Record<string, ScreenModule> | PageRoute[]): Route[] {
    const routes: Route[] = []

    if (Array.isArray(screens)) {
        for (const route of screens) {
            routes.push({
                path: route.path,
                Component: route.component,
            })
        }

        routes.sort((a, b) => {
            const aHasParams = a.path.includes(':')
            const bHasParams = b.path.includes(':')

            if (aHasParams !== bHasParams) {
                return aHasParams ? 1 : -1
            }

            const aSegments = a.path.split('/').length
            const bSegments = b.path.split('/').length

            return bSegments - aSegments
        })

        return routes
    }

    for (const [path, module] of Object.entries(screens)) {
        let routePath = path
            .replace(/^\.\//, '')
            .replace(/\.tsx?$/, '')
            .replace(/\/index$/, '')
            .replace(/\[(\w+)\]/g, ':$1')

        if (routePath === 'index') {
            routePath = '/'
        } else if (!routePath.startsWith('/')) {
            routePath = `/${routePath}`
        }

        routes.push({
            path: routePath,
            Component: module.default,
        })
    }

    routes.sort((a, b) => {
        const aHasParams = a.path.includes(':')
        const bHasParams = b.path.includes(':')

        if (aHasParams !== bHasParams) {
            return aHasParams ? 1 : -1
        }

        const aSegments = a.path.split('/').length
        const bSegments = b.path.split('/').length

        return bSegments - aSegments
    })

    return routes
}
