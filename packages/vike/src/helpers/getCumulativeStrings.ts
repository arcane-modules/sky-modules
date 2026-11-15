/**
 * Get and join cumulative string values.
 *
 * @module
 */

import type { PageContext } from 'vike/types'

/**
 * Get and join cumulative string values.
 *
 * @global
 * @param pageContext - Vike page context.
 * @param setting - Setting name.
 * @param separator - Separator between values (default: newline).
 * @returns Joined string or empty string.
 */
export default function getCumulativeStrings(pageContext: PageContext, setting: string, separator = '\n'): string {
    const config = (pageContext as unknown as { config?: Record<string, unknown> }).config
    const values = config?.[setting]

    if (!Array.isArray(values)) {
        return ''
    }

    return values.filter((v): v is string => typeof v === 'string').join(separator)
}
