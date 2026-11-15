/**
 * @sky-modules/share — Object serialization for network transmission.
 *
 * Converts reactive objects to plain data for CREATE/SET deltas.
 * Handles nested objects, arrays, and special types (Date, Map, Set).
 */

import { idSymbol, uidSymbol } from '@sky-modules/define'

/**
 * Serialize a reactive object to plain data for network transmission.
 *
 * - Nested @define objects are converted to their IDs (references)
 * - Plain objects are recursively serialized
 * - Arrays are recursively serialized
 * - Special types (Date, Map, Set) are converted to plain structures
 *
 * @param target - The object to serialize
 * @returns Plain data suitable for JSON serialization
 */
export function serializeObject(target: unknown): unknown {
    if (target == null) return target
    if (typeof target !== 'object') return target

    // Handle arrays
    if (Array.isArray(target)) {
        return target.map(serializeObject)
    }

    const obj = target as Record<string, unknown>

    // Handle @define objects — serialize as ID reference
    // Only check for idSymbol if it's an own property (not inherited through proxy)
    if (Object.hasOwn(target, idSymbol)) {
        const instanceId = (target as Record<symbol, unknown>)[idSymbol] as number | undefined
        if (instanceId != null) {
            return instanceId
        }
    }

    // Handle Date
    if (target instanceof Date) {
        return { __type: 'Date', value: target.toISOString() }
    }

    // Handle Map
    if (target instanceof Map) {
        const entries: Array<[unknown, unknown]> = []
        for (const [k, v] of target.entries()) {
            entries.push([serializeObject(k), serializeObject(v)])
        }
        return { __type: 'Map', entries }
    }

    // Handle Set
    if (target instanceof Set) {
        const values: unknown[] = []
        for (const v of target.values()) {
            values.push(serializeObject(v))
        }
        return { __type: 'Set', values }
    }

    // Handle plain objects — recursively serialize
    // Use for...in to capture properties defined on the prototype (via decorators)
    // Skip properties inherited from Object.prototype
    const result: Record<string, unknown> = {}
    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            // Own property
            result[key] = serializeObject(obj[key])
        } else {
            // Check if it's on the object's direct prototype (from decorators)
            const proto = Object.getPrototypeOf(obj)
            if (proto && Object.hasOwn(proto, key)) {
                result[key] = serializeObject(obj[key])
            }
        }
    }

    return result
}

/**
 * Deserialize plain data back to a reactive object.
 *
 * Reconstructs the object structure from serialized data.
 * Nested @define objects are left as IDs (caller must resolve).
 *
 * @param data - Plain data from network
 * @returns Deserialized value
 */
export function deserializeObject(data: unknown): unknown {
    if (data == null) return data
    if (typeof data !== 'object') return data

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(deserializeObject)
    }

    const obj = data as Record<string, unknown>

    // Handle special types
    if (obj.__type === 'Date') {
        return new Date(obj.value as string)
    }

    if (obj.__type === 'Map') {
        const entries = obj.entries as Array<[unknown, unknown]>
        return new Map(entries.map(([k, v]) => [deserializeObject(k), deserializeObject(v)]))
    }

    if (obj.__type === 'Set') {
        const values = obj.values as unknown[]
        return new Set(values.map(deserializeObject))
    }

    // Handle plain objects
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(obj)) {
        result[key] = deserializeObject(obj[key])
    }

    return result
}

/**
 * Get the class UID from a @define object.
 */
export function getClassUid(target: object): string | undefined {
    const ctor = target.constructor as unknown as Record<symbol, unknown>
    return ctor[uidSymbol] as string | undefined
}

/**
 * Get the instance ID from a shared object.
 */
export function getInstanceId(target: object): number | undefined {
    return (target as Record<symbol, unknown>)[idSymbol] as number | undefined
}
