/**
 * Error thrown when a promise times out.
 */
export class TimeoutError extends Error {
    constructor(ms: number) {
        super(`Promise timed out after ${ms}ms`)
        this.name = 'TimeoutError'
    }
}

/**
 * Wrap a promise with a timeout.
 * Rejects with TimeoutError if the promise doesn't resolve within the specified time.
 *
 * @example
 * ```typescript
 * try {
 *     const result = await timeout(fetch('/api/data'), 5000)
 * } catch (error) {
 *     if (error instanceof TimeoutError) {
 *         console.log('Request timed out')
 *     }
 * }
 * ```
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new TimeoutError(ms))
        }, ms)

        promise
            .then((value) => {
                clearTimeout(timer)
                resolve(value)
            })
            .catch((error) => {
                clearTimeout(timer)
                reject(error)
            })
    })
}
