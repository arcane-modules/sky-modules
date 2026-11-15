/**
 * Panda CSS configuration
 *
 * Panda CSS (formerly Chakra UI) integration for Box component.
 *
 * @module
 */

/**
 * Panda CSS theme configuration
 *
 * @global
 */
export interface PandaThemeConfig {
    /** Theme name */
    name: string

    /** Theme token values */
    tokens: {
        /** Colors */
        colors: Record<string, string>
        /** Shadows */
        shadows?: Record<string, string>
        /** Font sizes */
        fontSizes?: Record<string, string>
        /** Font families */
        fontFamilies?: Record<string, string>
    }
}

/**
 * Panda CSS theme with default configuration
 *
 * @global
 */
export const defaultPandaTheme: PandaThemeConfig = {
    name: 'sky-modules',
    tokens: {
        colors: {
            primary: '#0ea5e9',
            secondary: '#64748b',
            background: '#fafafa',
            foreground: '#18181b',
        },
        shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
        },
    },
}

/**
 * Panda CSS theme context
 *
 * @global
 */
export interface PandaThemeContext {
    /** Current theme */
    theme?: PandaThemeConfig
    /** Theme variants */
    variants?: Record<string, PandaThemeConfig>
}

/**
 * Panda CSS theme provider
 *
 * @global
 */
export function usePandaTheme(): PandaThemeContext {
    const theme: PandaThemeContext = {}
    return theme
}
