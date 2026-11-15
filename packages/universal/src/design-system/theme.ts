/**
 * Theme configuration
 *
 * Defines how colors adapt to light and dark modes.
 * Can be auto-generated or manually defined.
 *
 * @module
 */

/**
 * Theme configuration interface
 *
 * Defines theme modes (light/dark) and auto-generation
 *
 * @global
 * @example
 * ```typescript
 * const themes: ThemesConfig = {
 *   default: 'light',
 *   light: {},
 *   dark: { auto: true }
 * }
 * ```
 */
export interface ThemeDefinition {
    /** Auto-generate dark variants */
    auto?: boolean
    /** Theme-specific color overrides */
    colors?: Record<string, string>
}

export interface ThemesConfig {
    /** Default theme */
    default: string

    /** Available themes */
    [key: string]: string | ThemeDefinition | undefined
}
