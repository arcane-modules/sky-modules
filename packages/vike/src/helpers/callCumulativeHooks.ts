/**
 * Call cumulative hooks in sequence.
 *
 * Executes an array of async hooks from pageContext.config.
 *
 * @module
 */

import type { PageContext } from 'vike/types'

/**
 * Call cumulative hooks in sequence.
 *
 * @global
 * @param pageContext - Vike page context.
 * @param hookName - Name of the hook array in config.
 * @param args - Arguments to pass to each hook.
 * @returns Result from last hook that returns a value, or undefined.
 */
export default async function callCumulativeHooks<T>(
    pageContext: PageContext,
    hookName: string,
    ...args: unknown[]
): Promise<T | undefined> {
    const config = (pageContext as unknown as { config?: Record<string, unknown> }).config
    const hooks = config?.[hookName]

    if (!Array.isArray(hooks) || hooks.length === 0) {
        return undefined
    }

    let result: T | undefined

    for (const hook of hooks) {
        if (typeof hook === 'function') {
            const hookResult = await (hook as (...args: unknown[]) => Promise<T>)(...args)

            if (hookResult !== undefined) {
                result = hookResult
            }
        }
    }

    return result
}
