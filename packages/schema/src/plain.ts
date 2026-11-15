/**
 * Plain object utilities for schema types.
 *
 * Provides:
 * - `Plain<T>` — type that extracts the plain object type from a schema
 * - `makePlain()` — create a plain object from a class constructor
 * - `createPlain()` — create a plain object from a schema definition
 */

import { schemaSymbol } from '@sky-modules/define'
import type { Class } from './Class'
import type { ExtractSchemaType } from './types'

/**
 * @global
 * Extracts the plain object type from a schema class or schema definition.
 *
 * @typeParam T - Schema type.
 *
 * @example
 * ```ts
 * class Player {
 *     \@number x = 0
 *     \@number y = 0
 *     \@string name = ''
 * }
 *
 * type PlayerPlain = Plain<typeof Player>
 * // { x: number, y: number, name: string }
 * ```
 */
export type Plain<T> =
    T extends Class<infer I>
        ? I extends object
            ? { [K in keyof I]: I[K] }
            : never
        : T extends object
          ? { [K in keyof T]: ExtractSchemaType<T[K]> }
          : never

/**
 * @global
 * Get the schema definition from a class prototype.
 *
 * @param target - Object to get schema from.
 * @returns Schema definition or undefined if not found.
 *
 * @example
 * ```ts
 * const schema = getSchema(Player.prototype)
 * // { x: number, y: number, name: string }
 * ```
 */
function getSchema(target: object): Record<PropertyKey, unknown> | undefined {
    return (target as Record<symbol, unknown>)[schemaSymbol] as Record<PropertyKey, unknown> | undefined
}

/**
 * @global
 * Create a plain object from a class constructor, applying initial values.
 *
 * @param Constructor - The class constructor with schema decorators.
 * @param initial - Optional initial values to apply.
 * @returns A plain object with the schema's properties.
 *
 * @example
 * ```ts
 * const player = makePlain(Player, { x: 10, y: 20 })
 * // { x: 10, y: 20, name: '' }
 * ```
 */
export function makePlain<T extends Class>(Constructor: T, initial?: Partial<Plain<T>>): Plain<T> {
    const instance = new Constructor()
    const schema = getSchema(Constructor.prototype)

    if (!schema) {
        return instance as Plain<T>
    }

    const result: Record<PropertyKey, unknown> = {}

    for (const key of Object.keys(schema)) {
        result[key] = (instance as Record<PropertyKey, unknown>)[key]
    }

    if (initial) {
        for (const [key, value] of Object.entries(initial)) {
            if (key in schema) {
                result[key] = value
            }
        }
    }

    return result as Plain<T>
}

/**
 * @global
 * Create a plain object from a schema definition.
 *
 * @global
 * @param schema - The schema definition object.
 * @returns A plain object with default values (undefined for all properties).
 *
 * @example
 * ```ts
 * const PlayerSchema = {
 *     x: number,
 *     y: number,
 *     name: string,
 * }
 *
 * const player = createPlain(PlayerSchema)
 * // { x: undefined, y: undefined, name: undefined }
 * ```
 */
export function createPlain<T extends Record<PropertyKey, unknown>>(schema: T): { [K in keyof T]: unknown } {
    const result: Record<PropertyKey, unknown> = {}

    for (const key of Object.keys(schema)) {
        result[key] = undefined
    }

    return result as { [K in keyof T]: unknown }
}

/**
 * @global
 * Check if an object has a schema definition on its prototype.
 *
 * @param target - Object to check.
 * @returns true if object has schema, false otherwise.
 *
 * @example
 * ```ts
 * hasSchema(Player.prototype) // true
 * hasSchema({}) // false
 * ```
 */
export function hasSchema(target: object): boolean {
    return getSchema(target) !== undefined
}

/**
 * @global
 * @global
 * Get the schema keys from a class prototype.
 *
 * @param target - Object to get schema keys from.
 * @returns Array of schema property keys, or empty array if no schema.
 *
 * @example
 * ```ts
 * getSchemaKeys(Player.prototype) // ['x', 'y', 'name']
 * ```
 */
export function getSchemaKeys(target: object): string[] {
    const schema = getSchema(target)
    return schema ? Object.keys(schema) : []
}
