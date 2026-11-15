/**
 * Lamps — isolated reactive state units with sync callbacks.
 *
 * Each lamp owns its own state and provides `onSync()` for subscribing
 * to changes. No graph traversal — flat key:value deltas only.
 *
 * @module @sky-modules/reactive/lamps
 */

export { SignalLamp } from './SignalLamp'
export type { SyncCallback } from './SignalLamp'

export { signal, getRawValue, isSignal } from './signal'

export { reactiveArray, getInternalArray, isReactiveArray } from './reactiveArray'
export type { ReactiveArray, ArrayChangeEvent, ArrayChangeCallback } from './reactiveArray'
