/**
 * @global
 * Class type — represents a constructor function.
 *
 * @typeParam T - Type parameter for class instance.
 * @typeParam U - Constructor function type (defaults to object).
 */
export type Class<T = object> = new (...args: unknown[]) => T
