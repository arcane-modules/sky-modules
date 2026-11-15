/**
 * @global
 * ReactiveArray — array wrapper with change tracking.
 *
 * Provides a standard array API (push, pop, splice, shift, unshift, etc.)
 * with an `onChange` callback that fires on every mutation.
 *
 * Designed to be used inside SignalLamp state for list synchronization.
 * Changes are serialized as value arrays, not graph-based deltas.
 */

/**
 * @global
 * Change event types for ReactiveArray.
 */
export type ArrayChangeEvent =
    | { type: 'push'; items: unknown[] }
    | { type: 'pop'; item: unknown }
    | { type: 'shift'; item: unknown }
    | { type: 'unshift'; items: unknown[] }
    | { type: 'splice'; start: number; deleteCount: number; items: unknown[] }
    | { type: 'set'; index: number; value: unknown }
    | { type: 'clear' }

/**
 * @global
 * Change callback type.
 */
export type ArrayChangeCallback = (event: ArrayChangeEvent, array: unknown[]) => void

/**
 * Internal symbol for storing the change callback
 */
const CHANGE_CALLBACK = Symbol('changeCallback')

/**
 * Internal symbol for the underlying array
 */
const INTERNAL_ARRAY = Symbol('internalArray')

/**
 * @global
 * ReactiveArray interface — behaves like a standard array but tracks changes.
 */
export interface ReactiveArray<T = unknown> {
    /** Get the length of the array */
    readonly length: number

    /** Access elements by index */
    [index: number]: T

    /** Add elements to the end */
    push(...items: T[]): number

    /** Remove and return the last element */
    pop(): T | undefined

    /** Remove and return the first element */
    shift(): T | undefined

    /** Add elements to the beginning */
    unshift(...items: T[]): number

    /** Remove/replace elements */
    splice(start: number, deleteCount?: number, ...items: T[]): T[]

    /** Get array iterator */
    [Symbol.iterator](): IterableIterator<T>

    /** Get entries iterator */
    entries(): IterableIterator<[number, T]>

    /** Get keys iterator */
    keys(): IterableIterator<number>

    /** Get values iterator */
    values(): IterableIterator<T>

    /** Check if value is in array */
    includes(value: T, fromIndex?: number): boolean

    /** Find index of value */
    indexOf(value: T, fromIndex?: number): number

    /** Get a copy of the underlying array */
    toArray(): T[]

    /** Remove all elements */
    clear(): void

    /** Set value at index (triggers change event) */
    set(index: number, value: T): void

    /** Internal: get the underlying array */
    [INTERNAL_ARRAY]: T[]
    /** Internal: change callback */
    [CHANGE_CALLBACK]: ArrayChangeCallback | undefined
}

/**
 * Create a reactive array with change tracking.
 *
 * @param initial - Initial array elements
 * @param onChange - Optional change callback
 *
 * @example
 * ```ts
 * const arr = reactiveArray([1, 2, 3])
 * arr.onChange((event) => {
 *     console.log('Changed:', event)
 * })
 * arr.push(4)  // triggers onChange with { type: 'push', items: [4] }
 * ```
 */
export function reactiveArray<T = unknown>(initial: T[] = [], onChange?: ArrayChangeCallback): ReactiveArray<T> {
    const internal: T[] = [...initial]
    let changeCallback: ArrayChangeCallback | undefined = onChange

    const proxy = new Proxy({} as ReactiveArray<T>, {
        get(target: ReactiveArray<T>, key: PropertyKey): unknown {
            if (key === INTERNAL_ARRAY) {
                return internal
            }
            if (key === CHANGE_CALLBACK) {
                return changeCallback
            }
            if (key === 'length') {
                return internal.length
            }
            if (key === 'toArray') {
                return () => [...internal]
            }
            if (key === 'clear') {
                return () => {
                    internal.length = 0
                    changeCallback?.({ type: 'clear' }, internal)
                }
            }
            if (key === 'set') {
                return (index: number, value: T) => {
                    internal[index] = value
                    changeCallback?.({ type: 'set', index, value }, internal)
                }
            }
            if (key === 'push') {
                return (...items: T[]) => {
                    const result = internal.push(...items)
                    changeCallback?.({ type: 'push', items }, internal)
                    return result
                }
            }
            if (key === 'pop') {
                return () => {
                    const item = internal.pop()
                    if (item !== undefined) {
                        changeCallback?.({ type: 'pop', item }, internal)
                    }
                    return item
                }
            }
            if (key === 'shift') {
                return () => {
                    const item = internal.shift()
                    if (item !== undefined) {
                        changeCallback?.({ type: 'shift', item }, internal)
                    }
                    return item
                }
            }
            if (key === 'unshift') {
                return (...items: T[]) => {
                    const result = internal.unshift(...items)
                    changeCallback?.({ type: 'unshift', items }, internal)
                    return result
                }
            }
            if (key === 'splice') {
                return (start: number, deleteCount?: number, ...items: T[]) => {
                    const actualDeleteCount = deleteCount ?? internal.length - start
                    const removed = internal.splice(start, actualDeleteCount, ...items)
                    changeCallback?.({ type: 'splice', start, deleteCount: actualDeleteCount, items }, internal)
                    return removed
                }
            }
            if (key === 'includes') {
                return (value: T, fromIndex?: number) => internal.includes(value, fromIndex)
            }
            if (key === 'indexOf') {
                return (value: T, fromIndex?: number) => internal.indexOf(value, fromIndex)
            }
            if (key === Symbol.iterator) {
                return () => internal[Symbol.iterator]()
            }
            if (key === 'entries') {
                return () => internal.entries()
            }
            if (key === 'keys') {
                return () => internal.keys()
            }
            if (key === 'values') {
                return () => internal.values()
            }
            if (key === 'onChange') {
                return (cb: ArrayChangeCallback) => {
                    changeCallback = cb
                }
            }
            if (typeof key === 'string' || typeof key === 'number') {
                const index = Number(key)
                if (!Number.isNaN(index)) {
                    return internal[index]
                }
            }

            return Reflect.get(target, key)
        },

        set(target: ReactiveArray<T>, key: PropertyKey, value: unknown): boolean {
            if (key === CHANGE_CALLBACK) {
                changeCallback = value as ArrayChangeCallback | undefined
                return true
            }
            if (typeof key === 'string' || typeof key === 'number') {
                const index = Number(key)
                if (!Number.isNaN(index) && index >= 0) {
                    internal[index] = value as T
                    changeCallback?.({ type: 'set', index, value }, internal)
                    return true
                }
            }
            return Reflect.set(target, key, value)
        },

        has(target: ReactiveArray<T>, key: PropertyKey): boolean {
            if (key === INTERNAL_ARRAY || key === CHANGE_CALLBACK) {
                return true
            }
            if (key === 'length') {
                return true
            }
            if (typeof key === 'string' || typeof key === 'number') {
                const index = Number(key)
                if (!Number.isNaN(index)) {
                    return index >= 0 && index < internal.length
                }
            }
            return key in target
        },

        ownKeys(): string[] {
            const keys: string[] = ['length']
            for (let i = 0; i < internal.length; i++) {
                keys.push(String(i))
            }
            return keys
        },

        getOwnPropertyDescriptor(_target: ReactiveArray<T>, key: PropertyKey): PropertyDescriptor | undefined {
            if (key === 'length') {
                return {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: internal.length,
                }
            }
            if (typeof key === 'string' || typeof key === 'number') {
                const index = Number(key)
                if (!Number.isNaN(index) && index >= 0 && index < internal.length) {
                    return {
                        enumerable: true,
                        configurable: true,
                        writable: true,
                        value: internal[index],
                    }
                }
            }
            return undefined
        },
    })

    return proxy
}

/**
 * Get the underlying array from a ReactiveArray.
 */
export function getInternalArray<T>(arr: ReactiveArray<T>): T[] {
    return arr[INTERNAL_ARRAY]
}

/**
 * Check if a value is a ReactiveArray.
 */
export function isReactiveArray(value: unknown): value is ReactiveArray {
    return value !== null && typeof value === 'object' && INTERNAL_ARRAY in value && CHANGE_CALLBACK in value
}
