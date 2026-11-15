/**
 * @global
 * Simple type assertion — throws if expression is falsy.
 */
export class AssertionError extends Error {
    constructor(message: string) {
        super(`assertion failed: ${message}`)
    }
}

/**
 * @global
 * Assert that an expression is truthy.
 *
 * @param expression - Expression to assert
 * @param message - Error message when assertion fails
 * @example
 * ```typescript
 * assert(value > 0, 'Value must be positive')
 * ```
 */
export function assert(expression: unknown, message: string): asserts expression {
    if (!expression) {
        throw new AssertionError(message)
    }
}
