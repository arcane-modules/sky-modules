/**
 * Serialization utilities for @sky-modules/save.
 *
 * Serializes objects with class metadata preservation for persistence.
 * Unlike share(), save() serializes ALL fields including @secret ones.
 * Modifiers (read/write/secret) only affect network synchronization.
 */

import { idSymbol, uidSymbol } from '@sky-modules/define'
import { getSchemaKeys } from '@sky-modules/schema'

/**
 * @global
 * Serialized data format with metadata separated from payload.
 *
 * @interface SerializedData - Structure for serialized data with class metadata.
 */
export interface SerializedData {
    /**
     * Fully qualified class name (e.g., 'app.User')
     */
    class: string

    /**
     * Unique instance ID
     */
    id: number

    /**
     * Migration version timestamp (e.g., '20241208_125510') or null
     */
    version: string | null

    /**
     * Actual object data
     */
    data: Record<string, unknown>
}

/**
 * @global
 * Serialized format for special types (Map, Set, Date, RegExp).
 *
 * @interface SerializedSpecialType - Structure for serialized special types.
 */
export interface SerializedSpecialType {
    /** Type of special type: 'Map' | 'Set' | 'Date' | 'RegExp' */
    __type: 'Map' | 'Set' | 'Date' | 'RegExp'

    /** Map entries: [key, value][] pairs */
    entries?: [unknown, unknown][]

    /** Set values */
    values?: unknown[]

    /** Date ISO string */
    value?: string

    /** RegExp source */
    source?: string

    /** RegExp flags */
    flags?: string
}

/**
 * @global
 * Serializes a value with class metadata, returning an object (not string).
 *
 * @param obj - Value to serialize.
 * @returns Serialized object with class metadata.
 *
 * @example
 * ```ts
 * serializeWithMetadata(new User())
 * // { class: 'app.User', id: 1, version: null, data: { name: 'Anna' } }
 * ```
 */
export function serializeWithMetadata(obj: unknown): unknown {
    if (obj == null) return obj
    if (typeof obj !== 'object') return obj

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(serializeWithMetadata)
    }

    // Handle Map
    if (obj instanceof Map) {
        return {
            __type: 'Map',
            entries: Array.from(obj.entries()).map(([k, v]) => [serializeWithMetadata(k), serializeWithMetadata(v)]),
        } satisfies SerializedSpecialType
    }

    // Handle Set
    if (obj instanceof Set) {
        return {
            __type: 'Set',
            values: Array.from(obj.values()).map(serializeWithMetadata),
        } satisfies SerializedSpecialType
    }

    // Handle Date
    if (obj instanceof Date) {
        return {
            __type: 'Date',
            value: obj.toISOString(),
        } satisfies SerializedSpecialType
    }

    // Handle RegExp
    if (obj instanceof RegExp) {
        return {
            __type: 'RegExp',
            source: obj.source,
            flags: obj.flags,
        } satisfies SerializedSpecialType
    }

    const record = obj as Record<string | symbol, unknown>

    // Handle @define registered classes
    const ctor = (obj as { constructor: { prototype?: object } }).constructor
    const classUid = (ctor as unknown as Record<symbol, unknown>)?.[uidSymbol] as string | undefined

    if (classUid) {
        const data: Record<string, unknown> = {}

        // Get schema keys from prototype to access reactive properties via getters
        const schemaKeys = getSchemaKeys(obj)

        // Save ALL fields from schema (including @secret - modifiers are only for share())
        for (const key of schemaKeys) {
            data[key] = serializeWithMetadata(record[key] as Record<string, unknown>)
        }

        // Also serialize any own properties not in schema
        for (const key of Object.keys(obj)) {
            if (!(key in data)) {
                data[key] = serializeWithMetadata((record as Record<string, unknown>)[key] as Record<string, unknown>)
            }
        }

        return {
            class: classUid,
            id: (record[idSymbol] as number) ?? 0,
            version: null,
            data,
        } satisfies SerializedData
    }

    // Handle plain objects
    const result: Record<string, unknown> = {}
    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            result[key] = serializeWithMetadata((record as Record<string, unknown>)[key] as Record<string, unknown>)
        } else {
            const proto = Object.getPrototypeOf(obj)
            if (proto && Object.hasOwn(proto, key)) {
                result[key] = serializeWithMetadata((record as Record<string, unknown>)[key] as Record<string, unknown>)
            }
        }
    }

    return result
}
