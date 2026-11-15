/**
 * Merge cumulative tag attributes into a single string.
 *
 * @module
 */

import type { PageContext } from 'vike/types'

/**
 * Merge cumulative tag attributes into a single string.
 *
 * @global
 * @param pageContext - Vike page context.
 * @param setting - Setting name ('htmlAttributes' or 'bodyAttributes').
 * @param defaults - Default attributes to include.
 * @returns Formatted attribute string.
 */
export default function mergeTagAttributes(
    pageContext: PageContext,
    setting: 'htmlAttributes' | 'bodyAttributes',
    defaults: Record<string, string> = {}
): string {
    const config = (pageContext as unknown as { config?: Record<string, unknown> }).config
    const attributeArrays = config?.[setting] as Record<string, string>[] | undefined

    const merged: Record<string, string> = { ...defaults }

    if (Array.isArray(attributeArrays)) {
        for (const attrs of attributeArrays) {
            if (attrs && typeof attrs === 'object') {
                Object.assign(merged, attrs)
            }
        }
    }

    return Object.entries(merged)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
            if (value === '') {
                return key
            }
            const escaped = String(value).replace(/"/g, '&quot;')
            return `${key}="${escaped}"`
        })
        .join(' ')
}
