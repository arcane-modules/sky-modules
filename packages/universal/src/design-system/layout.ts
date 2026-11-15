/**
 * Layout design tokens
 *
 * Container sizes, breakpoints, and layout constraints
 *
 * @module
 */

/**
 * Layout tokens interface
 *
 * Configuration for containers, breakpoints, and layout constraints
 *
 * @global
 * @example
 * ```typescript
 * const layout: DesignTokenLayout = {
 *   containers: {
 *     sm: '640px',
 *     md: '768px',
 *     lg: '1024px',
 *     xl: '1280px'
 *   },
 *   breakpoints: {
 *     sm: '640px',
 *     md: '768px',
 *     lg: '1024px',
 *     xl: '1280px'
 *   }
 * }
 * ```
 */
export interface DesignTokenLayout {
    /** Container sizes */
    containers: {
        sm: string
        md: string
        lg: string
        xl: string
    }

    /** Breakpoints */
    breakpoints: {
        sm: string
        md: string
        lg: string
        xl: string
    }

    /** Grid columns */
    grid: {
        columns: number
        gap: string
    }
}
