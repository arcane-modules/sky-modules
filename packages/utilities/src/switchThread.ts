/**
 * @global
 * Yield to event loop to allow other tasks to execute.
 *
 * @example
 * ```typescript
 * await switchThread() // Yield execution
 * ```
 */
export function switchThread(): Promise<void> {
    return Promise.resolve()
}
