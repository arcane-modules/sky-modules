/**
 * save() — Serializes an object to JSON string with class metadata preservation.
 *
 * Unlike share(), save() serializes ALL fields including @secret ones.
 * Modifiers (read/write/secret) only affect network synchronization.
 */

import { serializeWithMetadata } from './serialize'

/**
 * @global
 * Options for save function.
 */
export interface SaveOptions {
    /**
     * Skip schema check. Use with caution — IDs may be unstable without schema.
     * @default false
     */
    unsafe?: boolean
}

/**
 * Serializes a value to JSON string with class metadata preservation.
 * Objects registered with @define will include class, id, version for restoration.
 *
 * @param value - Value to serialize
 * @param options - Serialization options
 *
 * @example
 * ```ts
 * @define('app.User')
 * class User {
 *     @string name = 'Anna'
 *     @number age = 25
 *     @secret.string password = 'hidden'
 * }
 *
 * const user = new User()
 * const json = save(user)
 * // {"class":"app.User","id":1,"version":null,"data":{"name":"Anna","age":25,"password":"hidden"}}
 * ```
 */
export function save<T>(value: T, _options: SaveOptions = {}): string {
    return JSON.stringify(serializeWithMetadata(value))
}
