import { runtimeGlobals as g } from './globals'

/**
 * @global
 * Application platform target detection.
 *
 * Higher-level than `platform` — identifies the intended app framework.
 */

export type AppPlatformTarget =
    | 'cirrus'
    | 'web'
    | 'node'
    | 'electron'
    | 'tauri'
    | 'capacitor'
    | 'react-native'
    | 'unknown'

/**
 * @global
 * Detect application platform target.
 *
 * @returns Detected app platform target.
 */
function detectAppPlatformTarget(): AppPlatformTarget {
    // Cirrus
    if (typeof g.__CIRRUS__ !== 'undefined') {
        return 'cirrus'
    }

    // Electron
    if (typeof g.process !== 'undefined' && typeof g.process.versions?.electron === 'string') {
        return 'electron'
    }

    // Tauri
    if (typeof g.window !== 'undefined' && g.window.__TAURI__ !== undefined) {
        return 'tauri'
    }

    // Capacitor
    if (typeof g.window !== 'undefined' && g.window.Capacitor && typeof g.window.Capacitor.isNative !== 'undefined') {
        return 'capacitor'
    }

    // React Native
    if (typeof g.navigator !== 'undefined' && g.navigator.product === 'ReactNative') {
        return 'react-native'
    }

    // Pure Node (not Electron)
    if (typeof g.process !== 'undefined' && typeof g.process.versions?.node === 'string') {
        return 'node'
    }

    // Browser fallback
    if (typeof g.window !== 'undefined') {
        return 'web'
    }

    return 'unknown'
}

/**
 * @global
 * Detected application platform target.
 */
export const appPlatformTarget = detectAppPlatformTarget()
