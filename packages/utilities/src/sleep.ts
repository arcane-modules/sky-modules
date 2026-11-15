/**
 * Async sleep with timeout.
 *
 * @example
 * ```typescript
 * await sleep(1000) // Wait 1 second
 * await sleep(500)  // Wait 500ms
 * ```
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
