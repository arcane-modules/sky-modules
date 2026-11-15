/**
 * Determine if code runs on server or client side.
 *
 * @example
 * ```typescript
 * import { runsOnServerSide, runsOnClientSide } from '@sky-modules/platform'
 *
 * if (runsOnServerSide) {
 *     // Server-only code
 * }
 * ```
 */

const side = typeof window === 'undefined' ? ('server' as const) : ('client' as const)

/**
 * 'server' if running in Node.js/Cirrus/Deno/Bun, 'client' if in browser/Tauri/Capacitor.
 */
export const runsOnSide = side

/**
 * True if running on server side.
 */
export const runsOnServerSide = side === 'server'

/**
 * True if running on client side (browser/webview).
 */
export const runsOnClientSide = side === 'client'
