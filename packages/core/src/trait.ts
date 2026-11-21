/**
 * Instance API every trait must provide.
 * `set` takes the constructor arguments and only assigns fields.
 */
export interface TraitInstance<A extends unknown[]> {
    set(...args: A): this
    copy(other: this): this
    clone(): this
}

/**
 * Trait is a plain class: `constructor(...args)`, `set(...args)`, `copy(other)`, `clone()`.
 * It must be constructible without arguments (default values or an empty overload):
 * the constructor allocates nested state, `set` only assigns.
 */
export interface Trait<A extends unknown[], I extends TraitInstance<A> = TraitInstance<A>> {
    new (): I
    new (...args: A): I
    readonly prototype: I
}

/** Keys of the trait API; never merged into a composition. */
export type TraitApiKey = 'set' | 'copy' | 'clone'

/** Widest class shape accepted before the exact trait check. */
export type AnyTraitClass = new (...args: never[]) => object

/** `true` when both types are mutually assignable. */
export type IsSame<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

/**
 * `true` when the constructor accepts every tuple of `S`.
 * Distributes over a union of tuples, e.g. `set(...args: [color] | [r, g, b])`.
 */
type AcceptsArgs<T, I, S> = false extends (
    S extends unknown[]
        ? T extends new (
              ...args: S
          ) => I
            ? true
            : false
        : never
)
    ? false
    : true

/**
 * Resolves to `T` when the class satisfies the trait API, otherwise `never`.
 * The class must be constructible both without arguments and with the arguments of `set`.
 */
export type CheckTrait<T> = T extends new (
    ...args: never[]
) => infer I
    ? I extends { set(...args: infer S): I; copy(other: I): I; clone(): I }
        ? T extends new () => I
            ? AcceptsArgs<T, I, S> extends true
                ? T
                : never
            : never
        : never
    : never
