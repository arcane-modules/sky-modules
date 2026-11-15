import { runtimeGlobals as g } from './globals'

/**
 * @global
 * Runtime environment/platform detection.
 *
 * Detection order (first match wins):
 * 1. Cirrus
 * 2. Deno
 * 3. Bun
 * 4. Node.js
 * 5. Electron
 * 6. Tauri
 * 7. Capacitor
 * 8. Browser
 * 9. WebWorker
 * 10. unknown
 */

export type Platform =
    | 'cirrus'
    | 'node'
    | 'browser'
    | 'worker'
    | 'deno'
    | 'bun'
    | 'electron'
    | 'tauri'
    | 'capacitor'
    | 'unknown'

declare const Deno: unknown
declare const Bun: unknown

/**
 * @global
 * Detect runtime environment/platform.
 *
 * @returns Detected platform.
 */
function detectPlatform(): Platform {
    // Cirrus
    if (typeof g.__CIRRUS__ !== 'undefined') {
        return 'cirrus'
    }

    // Deno
    if (typeof Deno !== 'undefined') {
        return 'deno'
    }

    // Bun
    if (typeof Bun !== 'undefined') {
        return 'bun'
    }

    // Node.js / Electron
    if (g.process?.versions) {
        if (typeof g.process.versions.electron === 'string') {
            return 'electron'
        }
        if (typeof g.process.versions.node === 'string') {
            return 'node'
        }
    }

    // Tauri
    if (typeof g.window !== 'undefined' && g.window.__TAURI__ !== undefined) {
        return 'tauri'
    }

    // Capacitor
    if (g.window?.Capacitor && typeof g.window.Capacitor.isNative !== 'undefined') {
        return 'capacitor'
    }

    // Browser
    if (typeof g.window !== 'undefined') {
        return 'browser'
    }

    // WebWorker
    if (typeof g.self !== 'undefined') {
        return 'worker'
    }

    return 'unknown'
}

const detected = detectPlatform()

/**
 * @global
 * Detected runtime platform.
 */
export const platform = detected

/**
 * @global
 * True if running on Cirrus.
 */
export const isCirrus = detected === 'cirrus'

/**
 * @global
 * True if running on Node.js (but not Electron).
 */
export const isNode = detected === 'node'

/**
 * @global
 * True if running in a browser (but not Tauri/Capacitor).
 */
export const isBrowser = detected === 'browser'

/**
 * @global
 * True if running in a WebWorker.
 */
export const isWebWorker = detected === 'worker'

/**
 * @global
 * True if running on Deno.
 */
export const isDeno = detected === 'deno'

/**
 * @global
 * True if running on Bun.
 */
export const isBun = detected === 'bun'

/**
 * @global
 * True if running on Electron.
 */
export const isElectron = detected === 'electron'

/**
 * @global
 * True if running on Tauri.
 */
export const isTauri = detected === 'tauri'

/**
 * @global
 * True if running on Capacitor.
 */
export const isCapacitor = detected === 'capacitor'
