/**
 * Retry with exponential backoff on failure.
 */

/**
 * @global
 * Options for retry function.
 */
export interface RetryOptions {
    /** Maximum number of attempts (default: 3) */
    attempts?: number
    /** Initial delay in ms before first retry (default: 1000) */
    delay?: number
    /** Multiplier for exponential backoff (default: 2) */
    backoff?: number
    /** Maximum delay between retries in ms (default: 30000) */
    maxDelay?: number
    /** Function to determine if error is retryable (default: all errors) */
    retryIf?: (error: unknown) => boolean
    /** Callback on each retry attempt */
    onRetry?: (error: unknown, attempt: number) => void
}

/**
 * @global
 * Retry a function with exponential backoff.
 *
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise that resolves to function result
 * @example
 * ```typescript
 * const data = await retry(
 *     () => fetch('/api/data').then(r => r.json()),
 *     { attempts: 5 }
 * )
 * ```
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const { attempts = 3, delay = 1000, backoff = 2, maxDelay = 30000, retryIf = () => true, onRetry } = options

    let lastError: unknown
    let currentDelay = delay

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            if (attempt === attempts || !retryIf(error)) {
                throw error
            }

            onRetry?.(error, attempt)

            await new Promise((resolve) => setTimeout(resolve, currentDelay))
            currentDelay = Math.min(currentDelay * backoff, maxDelay)
        }
    }

    throw lastError
}
