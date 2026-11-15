/**
 * Semantic design tokens
 *
 * Role-based tokens referencing foundation tokens
 * Includes color palettes with states (primary, danger, etc.)
 *
 * @module
 */

/**
 * Semantic tokens interface
 *
 * Purpose-driven tokens referencing foundation tokens.
 * Includes color palettes with states (primary, danger, etc.)
 *
 * @global
 * @example
 * ```typescript
 * const semantic: DesignTokenSemantic = {
 *   palettes: {
 *     primary: '#0ea5e9',
 *     secondary: '#64748b',
 *     danger: '#ef4444',
 *     success: '#22c55e'
 *   },
 *   states: {
 *     hover: 1,
 *     active: 300
 *   }
 * }
 * ```
 */
export interface DesignTokenSemantic {
    /** Color palettes with semantic names */
    palettes: {
        primary: string
        secondary?: string
        danger?: string
        success?: string
        warning?: string
        info?: string
    }

    /** Interactive states */
    states: {
        hover: number
        active: number
        disabled: number
    }

    /** Semantic color references */
    references: {
        primary: string
        secondary?: string
        danger?: string
        success?: string
        warning?: string
        info?: string
    }
}
