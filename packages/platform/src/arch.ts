import { runtimeGlobals as g } from './globals'

/**
 * @global
 * CPU architecture detection.
 */

export type Arch = 'x64' | 'arm64' | 'ia32' | 'wasm32' | 'unknown'

/**
 * @global
 * Detect CPU architecture.
 *
 * @returns Detected architecture.
 */
function detectArch(): Arch {
    // Node.js / Cirrus / Deno / Bun
    if (typeof g.process !== 'undefined' && typeof g.process.arch === 'string') {
        const a = g.process.arch as string
        if (a === 'x64') return 'x64'
        if (a === 'arm64') return 'arm64'
        if (a === 'ia32' || a === 'x32') return 'ia32'
        if (a === 'wasm32') return 'wasm32'
    }

    // Browser / Tauri / Capacitor
    if (typeof g.navigator !== 'undefined') {
        const ua = g.navigator.userAgent || ''
        const plat = g.navigator.platform || ''

        if (
            plat.indexOf('Win64') >= 0 ||
            plat.indexOf('x64') >= 0 ||
            ua.indexOf('x64') >= 0 ||
            ua.indexOf('WOW64') >= 0 ||
            ua.indexOf('x86_64') >= 0
        ) {
            return 'x64'
        }

        if (
            plat.indexOf('arm64') >= 0 ||
            plat.indexOf('ARM64') >= 0 ||
            ua.indexOf('aarch64') >= 0 ||
            ua.indexOf('arm64') >= 0
        ) {
            return 'arm64'
        }
    }

    return 'unknown'
}

const detected = detectArch()

/**
 * @global
 * Detected CPU architecture.
 */
export const arch = detected

/**
 * @global
 * True if architecture is x86-64.
 */
export const isX64 = detected === 'x64'

/**
 * @global
 * True if architecture is ARM64.
 */
export const isArm64 = detected === 'arm64'
