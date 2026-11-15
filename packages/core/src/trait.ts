/**
 * Type-only marker that carries trait type parameters.
 * Never created at runtime.
 */
export declare const TRAIT_TYPES: unique symbol

export interface TraitTypes<N extends string, F extends object, M extends object, A extends unknown[]> {
    readonly name: N
    readonly fields: F
    readonly methods: M
    readonly args: A
}

/**
 * Stateless trait value: methods plus optional `init` that receives the same `this`.
 */
export type Trait<
    N extends string = string,
    F extends object = object,
    M extends object = object,
    A extends unknown[] = unknown[],
> = Readonly<M> & {
    readonly name: N
    init?(this: F, ...args: A): void
    readonly [TRAIT_TYPES]?: TraitTypes<N, F, M, A>
}

/**
 * Definition accepted by `defineTrait`. Methods and `init` see `this` as `F & M`.
 */
export type TraitDefinition<N extends string, F extends object, M extends object, A extends unknown[]> = M & {
    readonly name: N
    init?(this: F, ...args: A): void
} & ThisType<F & M>

/**
 * Declares a trait with explicit type parameters.
 * Runtime value is the definition object itself.
 */
export function defineTrait<N extends string, F extends object, M extends object, A extends unknown[] = []>(
    definition: TraitDefinition<N, F, M, A>
): Trait<N, F, M, A> {
    return definition
}
