import { runtimeGlobals as g } from './globals'

/**
 * @global
 * Operating system detection.
 */

export type OS = 'mac' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown'

/**
 * @global
 * Detect operating system.
 *
 * @returns Detected OS.
 */
function detectOS(): OS {
    // Node.js / Cirrus / Deno / Bun / Electron
    if (typeof g.process !== 'undefined' && typeof g.process.platform === 'string') {
        const p = g.process.platform as string
        if (p === 'darwin') return 'mac'
        if (p === 'win32') return 'windows'
        if (p === 'linux') return 'linux'
        if (p === 'android') return 'android'
    }

    // Browser / Tauri / Capacitor
    if (typeof g.navigator !== 'undefined') {
        const ua = g.navigator.userAgent || ''

        // Capacitor native platform
        if (g.window?.Capacitor) {
            if (typeof g.window.Capacitor.getPlatform === 'function') {
                const capPlatform = g.window.Capacitor.getPlatform() as string
                if (capPlatform === 'ios') return 'ios'
                if (capPlatform === 'android') return 'android'
            }
        }

        // User agent detection
        if (/android/i.test(ua)) return 'android'
        if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
        if (/Mac OS X/.test(ua)) return 'mac'
        if (/Windows/.test(ua)) return 'windows'
        if (/Linux/.test(ua)) return 'linux'
    }

    return 'unknown'
}

const detected = detectOS()

/**
 * @global
 * Detected operating system.
 */
export const os = detected

/**
 * @global
 * True if running on macOS.
 */
export const isMac = detected === 'mac'

/**
 * @global
 * True if running on Windows.
 */
export const isWindows = detected === 'windows'

/**
 * @global
 * True if running on Linux.
 */
export const isLinux = detected === 'linux'

/**
 * @global
 * True if running on Android.
 */
export const isAndroid = detected === 'android'

/**
 * @global
 * True if running on iOS.
 */
export const isIOS = detected === 'ios'
