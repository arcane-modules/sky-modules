/**
 * Get a head setting value from pageContext.config.
 *
 * @module
 */

import type { PageContext } from 'vike/types'

/**
 * Get a head setting value from pageContext.config.
 *
 * Priority: _configViaHook > config > defaultValue.
 *
 * @global
 * @param pageContext - Vike page context.
 * @param setting - Setting name to retrieve.
 * @param defaultValue - Default value if setting not found.
 * @returns Setting value or default.
 */
export default function getHeadSetting<T>(pageContext: PageContext, setting: string, defaultValue?: T): T | undefined {
    const ctx = pageContext as unknown as {
        _configViaHook?: Record<string, unknown>
        config?: Record<string, unknown>
    }

    if (ctx._configViaHook && setting in ctx._configViaHook) {
        const hookValue = ctx._configViaHook[setting]

        if (hookValue !== undefined && hookValue !== null) {
            return hookValue as T
        }
    }

    const config = ctx.config

    if (!config) {
        return defaultValue
    }

    const value = config[setting]

    if (Array.isArray(value)) {
        for (let i = value.length - 1; i >= 0; i--) {
            if (value[i] !== undefined && value[i] !== null && value[i] !== '') {
                return value[i] as T
            }
        }

        return defaultValue
    }

    return (value as T) ?? defaultValue
}
