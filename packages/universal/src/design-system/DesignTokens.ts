/**
 * Design tokens main file
 *
 * Combines foundation, semantic, layout, and theme tokens
 *
 * @module
 */

import type { DesignTokenFoundation } from './foundation'
import type { DesignTokenSemantic } from './semantic'
import type { DesignTokenLayout } from './layout'
import type { SchemesConfig } from './scheme'
import type { ThemesConfig } from './theme'

export type { DesignTokenFoundation, DesignTokenSemantic, DesignTokenLayout, SchemesConfig, ThemesConfig }

/**
 * Complete design tokens definition
 *
 * Defines a comprehensive design system including foundation tokens,
 * semantic tokens, themes (light/dark), and color schemes.
 *
 * @global
 * @example
 * ```typescript
 * const tokens: DesignTokens = {
 *   name: 'sky-modules',
 *   foundation: { colors: { blue: { 50: '#eff6ff' } } },
 *   semantic: { palettes: { primary: '#0ea5e9' } },
 *   themes: { default: 'light' },
 *   schemes: { default: 'blue' }
 * }
 * ```
 */
export interface DesignTokens {
    /** Token set name for data-tokens attribute */
    name: string

    /** Base token sets to extend from */
    extends?: DesignTokensDescription[]

    /** Foundation - atomic design tokens */
    foundation: DesignTokenFoundation

    /** Semantic tokens - role-based tokens */
    semantic: DesignTokenSemantic

    /** Layout system configuration */
    layout: DesignTokenLayout

    /** Theme modes (light/dark) */
    themes?: ThemesConfig

    /** Color schemes (accent variations) */
    schemes?: SchemesConfig
}

/**
 * Partial design tokens definition for extending or customizing
 *
 * All fields except name are optional, allowing selective overrides
 *
 * @global
 */
export interface DesignTokensDescription extends Partial<DesignTokens> {
    /** Token set name (required) */
    name: string
}

/**
 * Default design tokens
 *
 * Provides sensible defaults for common design system needs.
 *
 * @global
 * @example
 * ```typescript
 * import { defaultTokens } from '@sky-modules/universal/design-system'
 * const appTokens = { ...defaultTokens, name: 'my-app' }
 * ```
 */
export const defaultTokens: DesignTokens = {
    name: 'sky-modules',
    foundation: {
        colors: {
            primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 900: '#1e3a8a' },
            neutral: { 50: '#fafafa', 100: '#f4f4f5', 900: '#18181b' },
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
            fontWeight: { normal: '400', medium: '500', bold: '700' },
        },
        spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
        shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.15)',
        },
        borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
    },
    semantic: {
        palettes: {
            primary: '#0ea5e9',
            secondary: '#64748b',
            danger: '#ef4444',
            success: '#22c55e',
            warning: '#f59e0b',
            info: '#3b82f6',
        },
        states: { hover: 1, active: 300, disabled: 50 },
        references: {
            primary: '#0ea5e9',
            secondary: '#64748b',
            danger: '#ef4444',
            success: '#22c55e',
            warning: '#f59e0b',
            info: '#3b82f6',
        },
    },
    layout: {
        containers: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
        breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
        grid: { columns: 12, gap: '1rem' },
    },
    themes: {
        default: 'light',
        light: {},
        dark: { auto: true },
    },
    schemes: {
        default: 'blue',
        blue: { palettes: { primary: '#0ea5e9' } },
        purple: { palettes: { primary: '#8b5cf6' } },
        red: { palettes: { primary: '#ef4444' } },
    },
}
