/**
 * Deserialization utilities for @sky-modules/save.
 *
 * Deserializes JSON back to typed objects with class instances restored.
 */

import { defines, idSymbol } from '@sky-modules/define'
import { applyMigrations, getCurrentVersion, resolveClassName } from '@sky-modules/migration'
import type { SerializedData, SerializedSpecialType } from './serialize'

/**
 * @global
 * Checks if an object is in the serialized format.
 *
 * @param obj - Object to check.
 * @returns true if object has serialized data format.
 */
function isSerializedData(obj: unknown): obj is SerializedData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'class' in obj &&
        'data' in obj &&
        typeof (obj as SerializedData).class === 'string' &&
        typeof (obj as SerializedData).data === 'object'
    )
}

/**
 * @global
 * Deserializes a parsed object with class metadata restoration.
 *
 * @param obj - Object to deserialize.
 * @returns Deserialized object instance.
 */
export function deserializeWithMetadata(obj: unknown): unknown {
    if (obj == null) return obj
    if (typeof obj !== 'object') return obj

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(deserializeWithMetadata)
    }

    const record = obj as Record<string, unknown>

    // Handle special types (Map, Set, Date, RegExp)
    if ('__type' in record) {
        return deserializeSpecialType(record as unknown as SerializedSpecialType)
    }

    // Handle serialized format: {class, id, version, data}
    if (isSerializedData(record)) {
        return deserializeSerializedData(record)
    }

    // Handle plain objects
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(record)) {
        result[key] = deserializeWithMetadata(record[key])
    }

    return result
}

/**
 * @global
 * Deserializes special types (Map, Set, Date, RegExp).
 *
 * @param record - Serialized special type record.
 * @returns Deserialized special type instance.
 */
function deserializeSpecialType(record: SerializedSpecialType): unknown {
    switch (record.__type) {
        case 'Map': {
            const entries = record.entries as [unknown, unknown][]
            return new Map(entries.map(([k, v]) => [deserializeWithMetadata(k), deserializeWithMetadata(v)]))
        }
        case 'Set': {
            const values = record.values as unknown[]
            return new Set(values.map(deserializeWithMetadata))
        }
        case 'Date': {
            return new Date(record.value as string)
        }
        case 'RegExp': {
            return new RegExp(record.source as string, record.flags as string)
        }
        default:
            return record
    }
}

/**
 * @global
 * Deserializes serialized format: {class, id, version, data}
 *
 * @param record - Serialized data record.
 * @returns Deserialized object instance.
 */
function deserializeSerializedData(record: SerializedData): unknown {
    // Resolve class name through aliases (for backwards compatibility)
    const className = resolveClassName(record.class)

    const definition = defines[className]

    if (!definition) {
        throw new Error(
            `Unknown class: ${record.class}${record.class !== className ? ` (resolved to ${className})` : ''}. ` +
                'Make sure the class is registered with @define before calling load().'
        )
    }

    // Apply migrations if needed
    const currentVersion = getCurrentVersion()
    let data = record.data as Record<string, unknown>

    if (record.version !== currentVersion) {
        data = applyMigrations(className, data, record.version, currentVersion)
    }

    // Create instance and populate
    const Constructor = definition.value as new () => object
    const instance = new Constructor() as Record<string | symbol, unknown>

    // Override the instance id if provided
    if (record.id !== undefined) {
        Object.defineProperty(instance, idSymbol, {
            value: record.id,
            writable: false,
            enumerable: false,
            configurable: true,
        })
    }

    // Deserialize nested objects in data
    for (const [key, value] of Object.entries(data)) {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), key)
        if (descriptor?.set) {
            // Property has a setter (e.g., reactive decorator) — use it
            instance[key] = deserializeWithMetadata(value)
        } else {
            // No setter — define the property directly
            Object.defineProperty(instance, key, {
                value: deserializeWithMetadata(value),
                writable: true,
                enumerable: true,
                configurable: true,
            })
        }
    }

    return instance
}
