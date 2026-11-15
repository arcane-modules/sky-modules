/**
 * Foundation design tokens
 *
 * Core visual primitives: colors, typography, spacing, shadows, borders
 *
 * @module
 */

/**
 * Foundation tokens interface
 *
 * Atomic design tokens: colors, typography, spacing, shadows, borders
 *
 * @global
 * @example
 * ```typescript
 * const foundation: DesignTokenFoundation = {
 *   colors: {
 *     blue: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' }
 *   },
 *   typography: {
 *     fontFamily: 'system-ui, sans-serif',
 *     fontSize: { xs: '0.75rem', sm: '0.875rem' }
 *   },
 *   spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem' }
 * }
 * ```
 */
export interface DesignTokenFoundation {
    /** Color palette with semantic names */
    colors: Record<string, Record<string, string>>

    /** Type scale */
    typography: {
        fontFamily: string
        fontSize: Record<string, string>
        fontWeight: Record<string, string>
    }

    /** Spacing scale */
    spacing: Record<string, string>

    /** Shadow scale */
    shadows: Record<string, string>

    /** Border radius scale */
    borderRadius: Record<string, string>
}
