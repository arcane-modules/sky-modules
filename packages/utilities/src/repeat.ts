/**
 * Repeat a function a specified number of times.
 *
 * @example
 * ```typescript
 * await repeat(5, (i) => {
 *     console.log(`Iteration ${i}`)
 * })
 * ```
 */
export async function repeat<A extends unknown[]>(
    count: number,
    callback: (iteration: number, ...args: A) => unknown,
    ...args: A
): Promise<void> {
    for (let i = 0; i < count; ++i) {
        const result = callback(i, ...args)

        if (result instanceof Promise) {
            await result
        }
    }
}
