/**
 * @global
 * Overloads for type inference.
 */
function pipe<A>(value: A): A
function pipe<A, B>(value: A, fn1: (a: A) => B): B
function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C
function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D
function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E
function pipe<A, B, C, D, E, F>(
    value: A,
    fn1: (a: A) => B,
    fn2: (b: B) => C,
    fn3: (c: C) => D,
    fn4: (d: D) => E,
    fn5: (e: E) => F
): F
function pipe<A, B, C, D, E, F, G>(
    value: A,
    fn1: (a: A) => B,
    fn2: (b: B) => C,
    fn3: (c: C) => D,
    fn4: (d: D) => E,
    fn5: (e: E) => F,
    fn6: (f: F) => G
): G
function pipe<A, B, C, D, E, F, G, H>(
    value: A,
    fn1: (a: A) => B,
    fn2: (b: B) => C,
    fn3: (c: C) => D,
    fn4: (d: D) => E,
    fn5: (e: E) => F,
    fn6: (f: F) => G,
    fn7: (g: G) => H
): H
function pipe<A, B, C, D, E, F, G, H, I>(
    value: A,
    fn1: (a: A) => B,
    fn2: (b: B) => C,
    fn3: (c: C) => D,
    fn4: (d: D) => E,
    fn5: (e: E) => F,
    fn6: (f: F) => G,
    fn7: (g: G) => H,
    fn8: (h: H) => I
): I
/**
 * @global
 * Create a composed function from left to right.
 *
 * @param value - Initial value
 * @param fns - Array of functions to compose
 * @returns Result after applying all functions
 */
function pipe(value: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
    return fns.reduce((acc, fn) => fn(acc), value)
}

export default pipe

/**
 * @global
 * Create a composed function from left to right (flipped API).
 *
 * @param fns - Array of functions to compose
 * @returns Composed function
 */
export function flow<A, B>(fn1: (a: A) => B): (a: A) => B
export function flow<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C
export function flow<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D
export function flow<A, B, C, D, E>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): (a: A) => E
export function flow<A, B, C, D, E, F>(
    fn1: (a: A) => B,
    fn2: (b: B) => C,
    fn3: (c: C) => D,
    fn4: (d: D) => E,
    fn5: (e: E) => F
): (a: A) => F
export function flow(...fns: Array<(x: unknown) => unknown>): (x: unknown) => unknown {
    return (value: unknown) => fns.reduce((acc, fn) => fn(acc), value)
}

/**
 * Identity function — returns value unchanged.
 */
export const identity = <A>(a: A): A => a
