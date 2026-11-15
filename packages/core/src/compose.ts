import type { TRAIT_TYPES, Trait } from './trait'

type AnyTrait = Trait<string, object, object, unknown[]>

type TypesOf<T extends AnyTrait> = NonNullable<T[typeof TRAIT_TYPES]>

type IsSame<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

/** Marker for incompatible members; `compose` refuses such lists at compile time. */
export interface ShapeConflict<K extends PropertyKey> {
    readonly __conflict: K
}

/** Merges two member maps. Same key with different types becomes `ShapeConflict`. */
export type MergeShapes<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A
        ? K extends keyof B
            ? IsSame<A[K], B[K]> extends true
                ? A[K]
                : ShapeConflict<K>
            : A[K]
        : K extends keyof B
          ? B[K]
          : never
}

type ListFields<L extends readonly AnyTrait[]> = L extends readonly [
    infer H extends AnyTrait,
    ...infer R extends AnyTrait[],
]
    ? MergeShapes<TypesOf<H>['fields'], ListFields<R>>
    : object

type ListMethods<L extends readonly AnyTrait[]> = L extends readonly [
    infer H extends AnyTrait,
    ...infer R extends AnyTrait[],
]
    ? MergeShapes<TypesOf<H>['methods'], ListMethods<R>>
    : object

type HasConflict<S> = true extends {
    [K in keyof S]: S[K] extends ShapeConflict<PropertyKey> ? true : false
}[keyof S]
    ? true
    : false

type ListHasConflict<L extends readonly AnyTrait[]> =
    HasConflict<ListFields<L>> extends true ? true : HasConflict<ListMethods<L>>

type CheckedTraits<L extends readonly AnyTrait[]> = ListHasConflict<L> extends true ? never : L

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never

type ArgsEntry<T> = T extends AnyTrait
    ? [TypesOf<T>['args']] extends [[]]
        ? { readonly [K in TypesOf<T>['name']]?: TypesOf<T>['args'] }
        : { readonly [K in TypesOf<T>['name']]: TypesOf<T>['args'] }
    : never

/** Constructor argument map: trait name → tuple of `init` arguments. */
export type ComposeArgs<L extends readonly AnyTrait[]> = UnionToIntersection<ArgsEntry<L[number]>>

export type ComposedInstance<L extends readonly AnyTrait[]> = ListFields<L> & ListMethods<L>

export interface ComposedClass<L extends readonly AnyTrait[]> {
    new (
        ...args: Record<never, never> extends ComposeArgs<L> ? [ComposeArgs<L>?] : [ComposeArgs<L>]
    ): ComposedInstance<L>
}

const RESERVED_KEYS: ReadonlySet<string> = new Set(['name', 'init'])

function uniqueTraits(traits: readonly AnyTrait[]): AnyTrait[] {
    const seen = new Set<AnyTrait>()
    const result: AnyTrait[] = []
    for (const trait of traits) {
        if (seen.has(trait)) continue
        seen.add(trait)
        result.push(trait)
    }
    return result
}

function assertUniqueNames(traits: readonly AnyTrait[]): void {
    const names = new Map<string, AnyTrait>()
    for (const trait of traits) {
        const existing = names.get(trait.name)
        if (existing !== undefined && existing !== trait) {
            throw new Error(`compose: two different traits share the name "${trait.name}"`)
        }
        names.set(trait.name, trait)
    }
}

function collectMethods(traits: readonly AnyTrait[]): PropertyDescriptorMap {
    const owners = new Map<string, string>()
    const descriptors: PropertyDescriptorMap = {}

    for (const trait of traits) {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(trait))) {
            if (RESERVED_KEYS.has(key)) continue

            const owner = owners.get(key)
            if (owner !== undefined) {
                const previous = descriptors[key]
                if (previous?.value !== descriptor.value) {
                    throw new Error(`compose: method "${key}" is defined by both "${owner}" and "${trait.name}"`)
                }
                continue
            }

            owners.set(key, trait.name)
            descriptors[key] = descriptor
        }
    }

    return descriptors
}

/**
 * Builds a class whose prototype contains the methods of all traits (once)
 * and whose constructor runs each trait's `init` on the same instance.
 */
export function compose<const L extends readonly AnyTrait[]>(...traits: CheckedTraits<L>): ComposedClass<L> {
    const list = uniqueTraits(traits as unknown as readonly AnyTrait[])
    assertUniqueNames(list)
    const descriptors = collectMethods(list)

    class Composed {
        constructor(args: Record<string, unknown[] | undefined> = {}) {
            for (const trait of list) {
                trait.init?.call(this, ...(args[trait.name] ?? []))
            }
        }
    }

    Object.defineProperties(Composed.prototype, descriptors)

    return Composed as unknown as ComposedClass<L>
}
