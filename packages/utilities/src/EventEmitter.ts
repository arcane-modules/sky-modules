/** Argument list of one event. */
type EventArgs = unknown[]

/** Maps every event name to the tuple of its arguments. */
type EventMap<T> = { [K in keyof T]: EventArgs }

/** Listener with erased argument types, used for internal storage only. */
type StoredListener = (...args: EventArgs) => void

/**
 * Type-safe event emitter with generic event map.
 *
 * Events are defined as a map of event names to argument tuple arrays.
 *
 * @example
 * ```typescript
 * interface Events {
 *     click: [x: number, y: number]
 *     change: [value: string]
 * }
 *
 * const emitter = new EventEmitter<Events>()
 * emitter.on('click', (x, y) => console.log(x, y))
 * emitter.emit('click', 10, 20)
 * ```
 */
export class EventEmitter<T extends EventMap<T> = Record<string, EventArgs>> {
    private listeners: Record<string, StoredListener[]> = {}

    private anyListeners: StoredListener[] = []

    private pendingRemovals: Set<StoredListener> = new Set()

    private emitDepth = 0

    /**
     * @global
     * Register an event listener.
     *
     * @param ev - Event name
     * @param callback - Listener callback
     * @returns This instance for chaining
     */
    on<K extends keyof T & string>(ev: K, callback: (...args: T[K]) => void): this {
        const list = this.listeners[ev] ?? []
        list.push(callback as StoredListener)
        this.listeners[ev] = list
        return this
    }

    /**
     * @global
     * Register a wildcard listener that receives all events.
     * The first argument is the event name, followed by the event arguments.
     *
     * @param callback - Listener callback
     * @returns This instance for chaining
     */
    onAny(callback: (ev: keyof T & string, ...args: EventArgs) => void): this {
        this.anyListeners.push(callback as StoredListener)
        return this
    }

    /**
     * @global
     * Unregister an event listener.
     *
     * @param ev - Event name
     * @param callback - Listener callback to remove
     * @returns This instance for chaining
     */
    off<K extends keyof T & string>(ev: K, callback: (...args: T[K]) => void): this {
        if (this.emitDepth > 0) {
            this.pendingRemovals.add(callback as StoredListener)
        } else {
            const list = this.listeners[ev]
            if (list) {
                const idx = list.indexOf(callback as StoredListener)
                if (idx >= 0) {
                    list.splice(idx, 1)
                }
            }
        }
        return this
    }

    /**
     * @global
     * Remove all event listeners.
     *
     * @returns This instance for chaining
     */
    offAll(): this {
        this.listeners = {}
        this.anyListeners = []
        return this
    }

    /**
     * @global
     * Emit an event with arguments.
     *
     * @param ev - Event name
     * @param args - Event arguments
     * @returns This instance for chaining
     */
    emit<K extends keyof T & string>(ev: K, ...args: T[K]): this {
        this.emitDepth++

        const list = this.listeners[ev]
        if (list) {
            const len = list.length
            for (let i = 0; i < len; i++) {
                list[i]?.(...args)
            }
        }

        if (this.anyListeners.length > 0) {
            const len = this.anyListeners.length
            for (let i = 0; i < len; i++) {
                this.anyListeners[i]?.(ev, ...args)
            }
        }

        this.emitDepth--

        if (this.emitDepth === 0 && this.pendingRemovals.size > 0) {
            this._cleanupPendingRemovals()
        }

        return this
    }

    private _cleanupPendingRemovals(): void {
        for (const key of Object.keys(this.listeners)) {
            const list = this.listeners[key]
            if (list) {
                for (let i = list.length - 1; i >= 0; i--) {
                    const cb = list[i]
                    if (cb && this.pendingRemovals.has(cb)) {
                        list.splice(i, 1)
                    }
                }
            }
        }

        for (let i = this.anyListeners.length - 1; i >= 0; i--) {
            const cb = this.anyListeners[i]
            if (cb && this.pendingRemovals.has(cb)) {
                this.anyListeners.splice(i, 1)
            }
        }

        this.pendingRemovals.clear()
    }
}
