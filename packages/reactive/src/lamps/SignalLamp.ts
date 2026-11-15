/**
 * @global
 * SignalLamp — isolated reactive state component.
 *
 * A lamp wraps any object with reactive properties (decorated with @number,
 * @string, etc.) and provides sync callbacks for change notification.
 *
 * Key design principles:
 * - **Component, not base class**: lamp is a field on the object, not a parent
 * - **Isolated**: each lamp syncs only its own object's properties, no graph traversal
 * - **Flat deltas**: only SET (key: value), no deep traversal
 * - **Microtask batching**: multiple changes in one tick are batched into one callback
 *
 * @example
 * ```ts
 * class Player {
 *     \@number x = 0
 *     \@number y = 0
 *     lamp = new SignalLamp(this)
 * }
 *
 * const p = new Player()
 * p.lamp.onSync((delta) => console.log(delta))
 * p.x = 10  // triggers onSync with { x: 10 }
 * ```
 */

import { CHANGE_LISTENER } from '../internal/symbols'

/**
 * @global
 * Sync callback type — receives a delta object with changed key:value pairs.
 */
export type SyncCallback = (delta: Record<string, unknown>) => void

/**
 * Internal symbol for storing sync callbacks
 */
const SYNC_CALLBACKS = Symbol('syncCallbacks')

/**
 * Internal symbol for pending delta accumulator
 */
const PENDING_DELTA = Symbol('pendingDelta')

/**
 * Internal symbol for the commit scheduled flag
 */
const COMMIT_SCHEDULED = Symbol('commitScheduled')

/**
 * @global
 * Reactive state component that wraps an object and provides sync callbacks.
 *
 * @example
 * ```ts
 * const obj = { x: 0, y: 0 }
 * const lamp = new SignalLamp(obj)
 * lamp.onSync((delta) => console.log(delta))
 * ```
 */
export class SignalLamp {
    /**
     * @global
     * The target object being observed.
     */
    private _target: Record<string, unknown>

    /**
     * Internal storage for sync callbacks
     */
    private [SYNC_CALLBACKS]: Set<SyncCallback> = new Set()

    /**
     * Pending delta accumulator — collects changes before commit
     */
    private [PENDING_DELTA]: Record<string, unknown> = {}

    /**
     * Whether a microtask commit is already scheduled
     */
    private [COMMIT_SCHEDULED]: boolean = false

    /**
     * @global
     * Create a new SignalLamp that observes the given target object.
     *
     * @param target - Object with reactive properties (decorated with @number, @string, etc.)
     */
    constructor(target: Record<string, unknown>) {
        this._target = target
        this.connect()
    }

    /**
     * @global
     * Get the raw target object (not a snapshot, the actual object).
     */
    get target(): Record<string, unknown> {
        return this._target
    }

    /**
     * Connect to the target object by setting up a change listener.
     * The listener is called by reactive property setters (from @number, @string decorators).
     */
    private connect(): void {
        const targetWithSymbols = this._target as Record<symbol, unknown>

        // Get or create the change listener set
        let listeners = targetWithSymbols[CHANGE_LISTENER] as
            | Set<(key: PropertyKey, value: unknown, rawValue: unknown) => void>
            | undefined

        if (!listeners) {
            listeners = new Set()
            targetWithSymbols[CHANGE_LISTENER] = listeners
        }

        // Add our listener to the set
        const handler = (_key: PropertyKey, _value: unknown, rawValue: unknown) => {
            this.onStateChange(_key as string, rawValue)
        }
        listeners.add(handler)

        // Store for cleanup
        ;(this as unknown as Record<string, unknown>)._changeHandler = handler
    }

    /**
     * Called when a reactive property changes.
     * Accumulates the delta and schedules a microtask commit.
     */
    private onStateChange(key: string, rawValue: unknown): void {
        this[PENDING_DELTA][key] = rawValue

        if (!this[COMMIT_SCHEDULED]) {
            this[COMMIT_SCHEDULED] = true
            queueMicrotask(() => {
                this.commit()
            })
        }
    }

    /**
     * Flush pending deltas and notify all sync callbacks.
     */
    private commit(): void {
        this[COMMIT_SCHEDULED] = false
        const delta = this[PENDING_DELTA]
        this[PENDING_DELTA] = {}

        if (Object.keys(delta).length === 0) {
            return
        }

        for (const callback of this[SYNC_CALLBACKS]) {
            callback(delta)
        }
    }

    /**
     * Subscribe to state changes. The callback receives a delta object
     * with only the changed key:value pairs.
     *
     * Returns an unsubscribe function.
     *
     * @example
     * ```ts
     * const unsub = lamp.onSync((delta) => {
     *     console.log('Changed:', delta)
     * })
     * // Later:
     * unsub()
     * ```
     */
    onSync(callback: SyncCallback): () => void {
        this[SYNC_CALLBACKS].add(callback)

        return () => {
            this[SYNC_CALLBACKS].delete(callback)
        }
    }

    /**
     * Get a snapshot of the target's current values.
     * Returns a plain object with all enumerable properties (including inherited getters).
     * Uses for...in to capture properties defined on the prototype via decorators.
     */
    getSnapshot(): Record<string, unknown> {
        const result: Record<string, unknown> = {}
        for (const key in this._target) {
            result[key] = this._target[key]
        }
        return result
    }

    /**
     * Wait for all pending sync callbacks to be delivered.
     * Returns a promise that resolves after the next microtask.
     */
    async committed(): Promise<void> {
        if (this[COMMIT_SCHEDULED]) {
            await Promise.resolve()
            // One more tick to ensure commit ran
            await Promise.resolve()
        }
    }
}
