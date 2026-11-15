/**
 * Create a deferred promise with external resolve/reject control.
 *
 * Returns a tuple of [promise, resolve, reject] allowing external control
 * of promise resolution.
 *
 * @example
 * ```typescript
 * const [promise, resolve, reject] = deferred<string>()
 *
 * button.addEventListener('click', () => {
 *     resolve('clicked')
 * })
 *
 * const result = await promise // Waits for click
 * ```
 */
export function deferred<T = void>(): [Promise<T>, (value: T | PromiseLike<T>) => void, (reason?: unknown) => void] {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: unknown) => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return [promise, resolve, reject] as const
}
