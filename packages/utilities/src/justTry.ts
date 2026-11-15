/**
 * @global
 * Execute a function and return the result or undefined on error.
 *
 * @param fn - Function to execute
 * @returns Promise that resolves to function result or undefined on error
 * @example
 * ```typescript
 * const data = await justTry(() => JSON.parse(userInput))
 * if (data) {
 *     console.log('Valid JSON:', data)
 * }
 * ```
 */
export async function justTry<T>(fn: () => T): Promise<T | undefined> {
    try {
        return await fn()
    } catch {
        return undefined
    }
}
