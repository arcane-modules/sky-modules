/**
 * @sky-modules/share — Network sync for reactive lamps.
 *
 * Provides share/unshare/destroy for subscribing to object changes
 * and sending deltas over a transport.
 *
 * Key design:
 * - **Isolated**: each object syncs independently, no graph traversal
 * - **Flat deltas**: only key:value pairs, no deep nesting
 * - **Transport-agnostic**: user provides a send callback
 * - **Lamp-based**: uses SignalLamp's onSync for change detection
 *
 * @example
 * ```ts
 * import { define, number } from '@sky-modules/core'
 * import { share, unshare, destroy } from '@sky-modules/share'
 *
 * \@define('game.Player')
 * class Player {
 *     \@number x = 0
 *     \@number y = 0
 * }
 *
 * const player = new Player()
 *
 * // Share with a WebSocket
 * const ws = new WebSocket('ws://localhost')
 * share(player, (delta) => ws.send(JSON.stringify(delta)))
 *
 * // Later, update a property — delta is sent automatically
 * player.x = 10
 *
 * // Stop sharing
 * unshare(player)
 * ```
 */

import { idSymbol } from '@sky-modules/define'
import { SignalLamp } from '@sky-modules/reactive'
import { registerObject, unregisterObject } from './apply'
import { serializeObject, getClassUid } from './serialize'
import type { Delta, SendCallback } from './types'

/**
 * @global
 * Internal storage for share state per object.
 *
 * @interface ShareState - State for shared object.
 */
interface ShareState {
    /**
     * The lamp observing this object.
     */
    lamp: SignalLamp

    /**
     * The send callback.
     */
    send: SendCallback

    /**
     * Unsubscribe function for the lamp's onSync.
     */
    unsubSync: () => void

    /**
     * Whether this object has been shared (CREATE sent).
     */
    shared: boolean
}

/**
 * @global
 * Map of instance ID → share state.
 */
const shareStates = new Map<number, ShareState>()

/**
 * Subscribe to changes on an object and send deltas via the callback.
 *
 * On first call, sends a CREATE delta with the full object state.
 * On subsequent changes, sends SET deltas with only changed properties.
 *
 * The object must be registered with @define to have a class UID.
 *
 * @param target - The object to share
 * @param send - Callback that receives deltas (e.g., ws.send)
 *
 * @example
 * ```ts
 * const player = new Player()
 * share(player, (delta) => ws.send(JSON.stringify(delta)))
 * ```
 */
export function share<T extends object>(target: T, send: SendCallback): void {
    const targetRecord = target as Record<string | symbol, unknown>

    // Get or assign instance ID
    const instanceId = registerObject(target)

    // Don't share twice
    if (shareStates.has(instanceId)) {
        return
    }

    // Get class UID for CREATE delta
    const classUid = getClassUid(target)

    if (!classUid) {
        throw new Error(
            'Cannot share object without @define. ' + 'Make sure the class is registered with @define decorator.'
        )
    }

    // Create a lamp to observe changes
    const lamp = new SignalLamp(targetRecord)

    // Subscribe to changes
    const unsubSync = lamp.onSync((delta) => {
        // Send SET delta with changed properties
        const setDelta: Delta = {
            type: 'SET',
            id: instanceId,
            data: delta as Record<string, unknown>,
        }
        send(setDelta)
    })

    // Store share state
    shareStates.set(instanceId, {
        lamp,
        send,
        unsubSync,
        shared: false,
    })

    // Send CREATE delta with full state
    const snapshot = lamp.getSnapshot()
    const serialized = serializeObject(snapshot) as Record<string, unknown>

    const createDelta: Delta = {
        type: 'CREATE',
        id: instanceId,
        class: classUid,
        data: serialized,
    }
    send(createDelta)

    // Mark as shared
    const state = shareStates.get(instanceId)!
    state.shared = true
}

/**
 * @global
 * Unsubscribe from changes on an object.
 * Stops sending deltas but does NOT send a DESTROY delta.
 *
 * @param target - The object to unshare.
 */
export function unshare<T extends object>(target: T): void {
    const instanceId = (target as Record<symbol, unknown>)[idSymbol] as number | undefined

    if (instanceId == null) {
        return
    }

    const state = shareStates.get(instanceId)
    if (!state) {
        return
    }

    // Unsubscribe from lamp
    state.unsubSync()

    // Remove from registry
    shareStates.delete(instanceId)
    unregisterObject(target)
}

/**
 * @global
 * Destroy a shared object — sends a DESTROY delta and unsubscribes.
 *
 * @param target - The object to destroy.
 */
export function destroy<T extends object>(target: T): void {
    const instanceId = (target as Record<symbol, unknown>)[idSymbol] as number | undefined

    if (instanceId == null) {
        return
    }

    // Send DESTROY delta
    const state = shareStates.get(instanceId)
    if (state) {
        const destroyDelta: Delta = {
            type: 'DESTROY',
            id: instanceId,
        }
        state.send(destroyDelta)
    }

    // Unshare
    unshare(target)
}

/**
 * Check if an object is currently being shared.
 *
 * @param target - The object to check
 * @returns true if the object is shared
 */
export function isShared(target: object): boolean {
    const instanceId = (target as Record<symbol, unknown>)[idSymbol] as number | undefined
    if (instanceId == null) return false
    return shareStates.has(instanceId)
}

/**
 * Get the number of currently shared objects.
 */
export function sharedCount(): number {
    return shareStates.size
}

/**
 * Clear all share states (for testing).
 */
export function clearShareStates(): void {
    for (const state of shareStates.values()) {
        state.unsubSync()
    }
    shareStates.clear()
}
