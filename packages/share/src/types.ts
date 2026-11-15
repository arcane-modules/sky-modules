/**
 * @sky-modules/share — Delta types for network sync.
 *
 * Three delta types:
 * - CREATE: a new object was created (full state)
 * - SET: an existing object's properties changed (partial state)
 * - DESTROY: an object was removed
 *
 * @example
 * ```ts
 * // CREATE delta — new object
 * { type: 'CREATE', id: 1, class: 'game.Player', data: { x: 0, y: 0, health: 100 } }
 *
 * // SET delta — property change
 * { type: 'SET', id: 1, data: { health: 50 } }
 *
 * // DESTROY delta — object removed
 * { type: 'DESTROY', id: 1 }
 * ```
 */

/**
 * Delta sent when a new object is shared.
 * Contains the full state of the object.
 */
export interface CreateDelta {
    type: 'CREATE'
    /** Unique instance ID */
    id: number
    /** Class UID from @define (e.g. 'game.Player') */
    class: string
    /** Full serialized state */
    data: Record<string, unknown>
}

/**
 * Delta sent when an object's properties change.
 * Contains only the changed key:value pairs.
 */
export interface SetDelta {
    type: 'SET'
    /** Unique instance ID */
    id: number
    /** Changed key:value pairs */
    data: Record<string, unknown>
}

/**
 * Delta sent when an object is destroyed.
 */
export interface DestroyDelta {
    type: 'DESTROY'
    /** Unique instance ID */
    id: number
}

/**
 * Union of all delta types.
 */
export type Delta = CreateDelta | SetDelta | DestroyDelta

/**
 * Callback type for sending deltas to a remote peer.
 */
export type SendCallback = (delta: Delta) => void

/**
 * Callback type for receiving deltas from a remote peer.
 */
export type ReceiveCallback = (delta: Delta) => void
