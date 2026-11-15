/**
 * @global
 * Notify change listener(s) about a property change.
 * Supports both a single function and a Set of functions.
 *
 * @param listener - Listener function or Set of listeners.
 * @param key - Changed property key.
 * @param value - New value.
 * @param rawValue - Raw old value.
 */
function notifyChangeListener(
    listener:
        | ((key: PropertyKey, value: unknown, rawValue: unknown) => void)
        | Set<(key: PropertyKey, value: unknown, rawValue: unknown) => void>
        | undefined,
    key: PropertyKey,
    value: unknown,
    rawValue: unknown
): void {
    if (typeof listener === 'function') {
        listener(key, value, rawValue)
    } else if (listener instanceof Set) {
        for (const fn of listener) {
            fn(key, value, rawValue)
        }
    }
}

/**
 * @global
 * Reactive signal wrapper — creates a reactive proxy object backed by SolidJS signals.
 *
 * Each property gets its own `createSignal`. When a property is set, the signal
 * updates and registered change listeners are notified.
 *
 * This is the foundation for SignalLamp state management.
 */

import { createSignal } from 'solid-js'

import { CHANGE_LISTENER } from '../internal/symbols'

/**
 * Internal symbol to access the signal store from the proxy
 */
const SIGNAL_STORE = Symbol('signalStore')

/**
 * WeakSet to track signal proxies for isSignal()
 */
const signalProxies = new WeakSet<object>()

/**
 * Type for the signal store map
 */
type SignalStore = Map<string, ReturnType<typeof createSignal<unknown>>>

/**
 * @global
 * Check if a value is a plain object (not null, not array, not class instance).
 *
 * @param value - Value to check.
 * @returns true if value is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return false
    const proto = Object.getPrototypeOf(value)
    return proto === null || proto === Object.prototype
}

/**
 * @global
 * Deeply convert a value for storage — plain objects become reactive proxies,
 * arrays and primitives are stored as-is.
 *
 * @param value - Value to convert.
 * @returns Converted value.
 */
function toStoreValue(value: unknown): unknown {
    if (isPlainObject(value)) {
        return signal(value as Record<string, unknown>)
    }
    return value
}

/**
 * @global
 * Deeply extract raw values from a reactive proxy for delta serialization.
 *
 * @param value - Reactive proxy to extract raw values from.
 * @returns Raw value.
 */
function toRawValue(value: unknown): unknown {
    if (value && typeof value === 'object' && signalProxies.has(value)) {
        const store = (value as Record<symbol, unknown>)[SIGNAL_STORE] as SignalStore
        const raw: Record<string, unknown> = {}
        for (const [key] of store) {
            raw[key as string] = toRawValue((value as Record<PropertyKey, unknown>)[key as PropertyKey])
        }
        return raw
    }
    if (Array.isArray(value)) {
        return value.map(toRawValue)
    }
    return value
}

/**
 * Create a reactive signal wrapper around an initial object.
 *
 * Returns a proxy where each property is backed by a SolidJS signal.
 * Changes are tracked and can be listened to via the internal CHANGE_LISTENER symbol.
 *
 * @example
 * ```ts
 * const state = signal({ health: 100, name: 'hero' })
 * state.health = 50  // triggers change listener
 * ```
 */
export function signal<T extends Record<string, unknown>>(initial: T): T {
    const store: SignalStore = new Map()

    // Initialize signals for each property
    for (const key of Object.keys(initial)) {
        store.set(key, createSignal<unknown>(toStoreValue(initial[key])))
    }

    let changeListener:
        | ((key: PropertyKey, value: unknown, rawValue: unknown) => void)
        | Set<(key: PropertyKey, value: unknown, rawValue: unknown) => void>
        | undefined

    const handler: ProxyHandler<T> = {
        get(target: T, key: PropertyKey): unknown {
            if (key === SIGNAL_STORE) {
                return store
            }
            if (key === CHANGE_LISTENER) {
                return changeListener
            }

            const keyStr = typeof key === 'string' ? key : String(key)
            const signal = store.get(keyStr)
            if (signal !== undefined) {
                const [getter] = signal
                return getter()
            }

            return Reflect.get(target, key)
        },

        set(target: T, key: PropertyKey, value: unknown): boolean {
            if (key === CHANGE_LISTENER) {
                const newListener = value as typeof changeListener
                changeListener = newListener
                // Propagate to all nested signal proxies in the store
                for (const [propKey, signal] of store) {
                    const [getter] = signal
                    const currentValue = getter()
                    if (currentValue && typeof currentValue === 'object' && signalProxies.has(currentValue)) {
                        const capturedKey = propKey
                        ;(currentValue as Record<symbol, unknown>)[CHANGE_LISTENER] = (
                            _nestedKey: PropertyKey,
                            _nestedValue: unknown,
                            _nestedRawValue: unknown
                        ) => {
                            const parentSignal = store.get(capturedKey)
                            if (parentSignal) {
                                const cv = parentSignal[0]()
                                const rv = toRawValue(cv)
                                notifyChangeListener(changeListener, capturedKey, rv, rv)
                            }
                        }
                    }
                }
                return true
            }

            const keyStr = typeof key === 'string' ? key : String(key)
            const signal = store.get(keyStr)
            if (signal !== undefined) {
                const storedValue = toStoreValue(value)
                const [, setter] = signal
                setter(storedValue)

                // Propagate change listener to nested signal proxies
                if (storedValue && typeof storedValue === 'object' && signalProxies.has(storedValue)) {
                    ;(storedValue as Record<symbol, unknown>)[CHANGE_LISTENER] = (
                        _nestedKey: PropertyKey,
                        _nestedValue: unknown,
                        _nestedRawValue: unknown
                    ) => {
                        // Re-serialize the parent value to include nested changes
                        const parentSignal = store.get(keyStr)
                        if (parentSignal) {
                            const currentValue = parentSignal[0]()
                            const rawValue = toRawValue(currentValue)
                            notifyChangeListener(changeListener, keyStr, rawValue, rawValue)
                        }
                    }
                }

                // Notify change listener with raw (serializable) value
                notifyChangeListener(changeListener, key, value, toRawValue(value))
                return true
            }

            return Reflect.set(target, key, value)
        },

        has(target: T, key: PropertyKey): boolean {
            if (key === SIGNAL_STORE || key === CHANGE_LISTENER) {
                return true
            }
            const keyStr = typeof key === 'string' ? key : String(key)
            return store.has(keyStr) || Reflect.has(target, key)
        },

        ownKeys(_target: T): string[] {
            return [...store.keys()].map((k) => String(k))
        },

        getOwnPropertyDescriptor(_target: T, key: PropertyKey): PropertyDescriptor | undefined {
            const keyStr = typeof key === 'string' ? key : String(key)
            if (store.has(keyStr)) {
                const signal = store.get(keyStr)
                const value = signal ? signal[0]() : undefined
                return {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value,
                }
            }
            return Object.getOwnPropertyDescriptor(_target, key as unknown as string)
        },
    }

    const proxy = new Proxy<T>(initial, handler)
    signalProxies.add(proxy)
    return proxy
}

/**
 * Get the raw (serializable) value from a reactive signal proxy.
 * Nested reactive objects are recursively converted to plain objects.
 */
export function getRawValue<T>(proxy: T): T {
    if (proxy && typeof proxy === 'object' && signalProxies.has(proxy)) {
        const store = (proxy as Record<symbol, unknown>)[SIGNAL_STORE] as SignalStore
        const raw: Record<string, unknown> = {}
        for (const [key] of store) {
            raw[key as string] = toRawValue((proxy as Record<PropertyKey, unknown>)[key as PropertyKey])
        }
        return raw as T
    }
    return proxy
}

/**
 * Check if a value is a reactive signal proxy.
 */
export function isSignal(value: unknown): boolean {
    return value !== null && typeof value === 'object' && signalProxies.has(value)
}
