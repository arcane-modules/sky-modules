/**
 * load() — Deserializes a JSON string back to typed objects with class instances restored.
 */

import { deserializeWithMetadata } from './deserialize'

/**
 * @global
 * Options for load function.
 */
export interface LoadOptions {
    /**
     * Skip schema check. Use with caution — IDs may be unstable without schema.
     * @default false
     */
    unsafe?: boolean
}

/**
 * @global
 * Deserializes a JSON string back to typed objects with class instances restored.
 *
 * @param json - JSON string to deserialize.
 * @param options - Deserialization options.
 * @returns Deserialized object instance.
 *
 * @example
 * ```ts
 * @define('app.User')
 * class User {
 *     @string name = ''
 *     greet() { return `Hello ${this.name}` }
 * }
 *
 * const json = '{"class":"app.User","id":1,"version":null,"data":{"name":"Anna"}}'
 * const restored = load<User>(json)
 *
 * restored instanceof User // true
 * restored.greet() // "Hello Anna"
 * ```
 */
export function load<T = unknown>(json: string, _options: LoadOptions = {}): T {
    const parsed = JSON.parse(json)
    return deserializeWithMetadata(parsed) as T
}
