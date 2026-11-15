/**
 * Scheme configuration
 *
 * Different color identities (purple, red, corporate, etc.)
 * that can be combined with themes.
 *
 * @module
 */

/**
 * Scheme configuration interface
 *
 * Color schemes that can be combined with themes
 *
 * @global
 * @example
 * ```typescript
 * const schemes: SchemesConfig = {
 *   default: 'blue',
 *   purple: { palettes: { primary: '#8b5cf6' } },
 *   red: { palettes: { primary: '#ef4444' } }
 * }
 * ```
 */
export interface SchemeDefinition {
    /** Scheme palettes */
    palettes: {
        primary: string
        secondary?: string
    }
}

export interface SchemesConfig {
    /** Default scheme */
    default: string

    /** Available schemes */
    [key: string]: string | SchemeDefinition | undefined
}
