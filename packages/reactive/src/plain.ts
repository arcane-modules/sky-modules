/**
 * Plain object utilities for the reactive system.
 *
 * Creates constructors that produce plain objects (no class instance)
 * with reactive property descriptors from a schema.
 *
 * Used for inline schema definitions (not define-registered classes).
 *
 * @example
 * ```typescript
 * const PositionSchema = {
 *     x: number,
 *     y: number,
 * }
 *
 * const PlainPosition = makePlain(PositionSchema)
 * const pos = new PlainPosition({ x: 10, y: 20 })
 * // pos is a plain object with reactive getters/setters
 * ```
 */

import { constructorSymbol, schemaSymbol } from './internal/symbols'
import { reactivePropertyDescriptorMap } from './reactive'

/**
 * Make a constructor function from a schema object.
 * Schema values are decorator functions (number, string, etc.).
 *
 * @param schema - Schema object with decorators as values
 * @returns A constructor function that accepts initial values matching the schema types
 */
export function makePlain<T extends Record<string, unknown>>(
    schema: T
): new (
    object?: Record<string, unknown>
) => object {
    const propertiesMap = reactivePropertyDescriptorMap(schema as unknown as object)

    function PlainConstructor(this: object, object: object): object {
        Object.assign(this, object)
        return this
    }
    // Store schema reference
    ;(PlainConstructor as unknown as Record<symbol, object>)[schemaSymbol] = schema as unknown as object

    // Apply property descriptors to prototype
    ;(PlainConstructor as unknown as Record<symbol, object>)[constructorSymbol] = PlainConstructor

    PlainConstructor.prototype = Object.defineProperties({ constructor: PlainConstructor }, propertiesMap)

    return PlainConstructor as unknown as new (
        object?: Record<string, unknown>
    ) => object
}

/**
 * Create a plain reactive object from a schema.
 * Shorthand for `new (makePlain(schema))(initial)`.
 *
 * @param schema - Schema object (decorators as values)
 * @param initial - Initial values
 * @returns A plain reactive object
 */
export function createPlain<T extends Record<string, unknown>>(schema: T, initial?: Record<string, unknown>): object {
    const Constructor = makePlain(schema)
    return new Constructor(initial ?? {}) as object & T
}

/**
 * Check if an object is a plain reactive object (created via makePlain).
 */
export function isPlain(obj: unknown): boolean {
    if (obj == null || typeof obj !== 'object') {
        return false
    }

    const proto = Object.getPrototypeOf(obj)

    return proto?.constructor != null && constructorSymbol in (proto.constructor as unknown as object)
}

/**
 * Get the schema from a plain object's constructor.
 */
export function getPlainSchema<T extends object>(obj: T): Record<PropertyKey, unknown> | undefined {
    if (!isPlain(obj)) {
        return undefined
    }

    const ctor = Object.getPrototypeOf(obj)?.constructor

    if (ctor == null) {
        return undefined
    }

    return (ctor as unknown as Record<symbol, object>)[schemaSymbol] as Record<PropertyKey, unknown> | undefined
}
