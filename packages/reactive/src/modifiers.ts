/**
 * Modifier wrappers for reactive properties.
 *
 * Controls sync direction for the share system:
 * - `read(type)` — Server → Client only (default). Client cannot modify.
 * - `write(type)` — Bidirectional sync. Client can send updates to server.
 * - `secret(type)` — Excluded from sync and serialization entirely.
 *
 * @example
 * ```typescript
 * class Player {
 *     @read.number health = 100      // Server controls, client reads
 *     @write.number inputX = 0       // Client can send input
 *     @secret.string token = ''      // Never leaves the server
 * }
 * ```
 */

import { modifierSymbol, typeSymbol } from './internal/symbols'
import { Modifier } from './reactive'

/**
 * Wraps a schema type with a modifier.
 */
function createModifier<T>(modifier: Modifier, schemaType: T) {
    return {
        [modifierSymbol]: modifier,
        [typeSymbol]: schemaType,
    } as unknown as T
}

/**
 * @global
 * Marks a schema property as **read-only** (Server → Client).
 * This is the DEFAULT behavior.
 *
 * @param schema - The schema type to mark as read-only
 * @returns The schema type with read modifier
 *
 * @example
 * ```ts
 * const schema = { health: read(number) }
 * ```
 */
export function read<T>(schema: T): T {
    return createModifier(Modifier.READ, schema)
}

/**
 * @global
 * Marks a schema property as **writable** (bidirectional sync).
 * Client can send updates to server.
 *
 * @param schema - The schema type to mark as writable
 * @returns The schema type with write modifier
 *
 * @example
 * ```ts
 * const schema = { input: write(number) }
 * ```
 */
export function write<T>(schema: T): T {
    return createModifier(Modifier.WRITE, schema)
}

/**
 * @global
 * Marks a schema property as **secret** (excluded from sync and serialization).
 * Never sent over network, not included in save().
 *
 * @param schema - The schema type to mark as secret
 * @returns The schema type with secret modifier
 *
 * @example
 * ```ts
 * const schema = { token: secret(string) }
 * ```
 */
export function secret<T>(schema: T): T {
    return createModifier(Modifier.SECRET, schema)
}
