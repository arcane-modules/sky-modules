/**
 * @sky-modules/share — Network sync for reactive lamps.
 *
 * Isolated sync units with flat key:value deltas.
 * No graph traversal — each lamp syncs only its own state.
 *
 * @example
 * ```ts
 * import { define, number } from '@sky-modules/core'
 * import { share, apply } from '@sky-modules/share'
 *
 * // Server side
 * \@define('game.Player')
 * class Player {
 *     \@number x = 0
 *     \@number y = 0
 * }
 *
 * const player = new Player()
 * share(player, (delta) => ws.send(JSON.stringify(delta)))
 *
 * // Client side
 * ws.onmessage = (event) => {
 *     apply(JSON.parse(event.data))
 * }
 * ```
 */

export { share, unshare, destroy, isShared, sharedCount, clearShareStates } from './share'
export {
    apply,
    registerObject,
    unregisterObject,
    getObjectById,
    getAllObjects,
    clearRegistry,
    resetIdCounter,
} from './apply'
export { serializeObject, deserializeObject, getClassUid, getInstanceId } from './serialize'
export type { Delta, CreateDelta, SetDelta, DestroyDelta, SendCallback, ReceiveCallback } from './types'
