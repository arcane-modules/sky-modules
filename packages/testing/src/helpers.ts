import { type Mock, vi } from 'vitest'

/**
 * @global
 * Wait for a specific amount of time.
 *
 * @param ms - Milliseconds to wait.
 *
 * @example
 * ```typescript
 * import { wait } from '@sky-modules/testing'
 *
 * await wait(100) // wait 100ms
 * ```
 */
export async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @global
 * Wait for a condition to become true.
 *
 * @param condition - Condition function.
 * @param timeout - Timeout in ms (default: 5000).
 * @param interval - Polling interval in ms (default: 50).
 *
 * @example
 * ```typescript
 * import { waitFor } from '@sky-modules/testing'
 *
 * await waitFor(() => document.readyState === 'complete')
 * ```
 */
export async function waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 50
): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return
        }

        await wait(interval)
    }

    throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

/**
 * @global
 * Create a spy function. Thin wrapper around `vi.fn()`.
 *
 * @example
 * ```typescript
 * import { createSpy } from '@sky-modules/testing'
 *
 * const spy = createSpy()
 * spy('hello')
 * expect(spy).toHaveBeenCalledWith('hello')
 * ```
 */
export function createSpy<A extends unknown[] = unknown[], R = unknown>(
    implementation?: (...args: A) => R
): Mock<(...args: A) => R> {
    return vi.fn(implementation)
}

/**
 * @global
 * Mock console methods to suppress output during tests.
 * Returns a cleanup function to restore original methods.
 *
 * @example
 * ```typescript
 * import { mockConsole } from '@sky-modules/testing'
 *
 * const cleanup = mockConsole()
 * console.log('silent') // no output
 * cleanup() // restore
 * ```
 */
export function mockConsole(): () => void {
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error
    const originalInfo = console.info

    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.info = vi.fn()

    return () => {
        console.log = originalLog
        console.warn = originalWarn
        console.error = originalError
        console.info = originalInfo
    }
}

/**
 * Create a deferred promise that can be resolved/rejected externally.
 *
 * @example
 * ```typescript
 * import { createDeferred } from '@sky-modules/testing'
 *
 * const { promise, resolve } = createDeferred<string>()
 * resolve('done')
 * expect(await promise).toBe('done')
 * ```
 */
export interface Deferred<T> {
    promise: Promise<T>
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: unknown) => void
}

export function createDeferred<T = void>(): Deferred<T> {
    let resolve: (value: T | PromiseLike<T>) => void
    let reject: (reason?: unknown) => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return {
        promise,
        resolve: resolve!,
        reject: reject!,
    }
}

/**
 * Flush all pending promises.
 * Useful for testing code that uses `Promise.resolve()` or microtask scheduling.
 *
 * @example
 * ```typescript
 * import { flushPromises } from '@sky-modules/testing'
 *
 * someAsyncOperation()
 * await flushPromises()
 * expect(result).toBe('done')
 * ```
 */
export async function flushPromises(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Run a function and expect it to throw. Returns the caught error.
 *
 * @example
 * ```typescript
 * import { expectToThrow } from '@sky-modules/testing'
 *
 * const error = await expectToThrow(() => { throw new Error('boom') })
 * expect(error.message).toBe('boom')
 * ```
 */
export async function expectToThrow<E = Error>(fn: () => void | Promise<void>): Promise<E> {
    try {
        await fn()
    } catch (error) {
        return error as E
    }

    throw new Error('Expected function to throw, but it did not')
}

/**
 * Create a mock that returns different values on successive calls.
 *
 * @example
 * ```typescript
 * import { createSequentialMock } from '@sky-modules/testing'
 *
 * const mock = createSequentialMock('a', 'b', 'c')
 * expect(mock()).toBe('a')
 * expect(mock()).toBe('b')
 * expect(mock()).toBe('c')
 * ```
 */
export function createSequentialMock<T>(...values: Array<T>): ReturnType<typeof vi.fn<() => T>> {
    let index = 0
    return vi.fn(() => {
        if (index >= values.length) {
            throw new Error(
                `Sequential mock exhausted (called ${index + 1} times, only ${values.length} values provided)`
            )
        }

        return values[index++]!
    })
}
