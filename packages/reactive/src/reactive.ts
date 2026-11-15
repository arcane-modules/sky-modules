/**
 * @global
 * Reactive property descriptor system.
 *
 * Uses SolidJS signals for fine-grained reactivity.
 * Each property gets its own signal, created lazily on first access.
 *
 * Supports:
 * - Primitive types (number, string, boolean)
 * - Nested objects (with schema)
 * - Arrays (with reactive tracking)
 * - Modifiers (read/write/secret)
 * - Raw setters (set without listener notification)
 */

import { createSignal } from 'solid-js'

import { idSymbol, modifierSymbol, rawSetterSymbol, typeSymbol, CHANGE_LISTENER } from './internal/symbols'

import { registerPropertyDescriptorHook } from '@sky-modules/define'

// ─── Storage Symbols ──────────────────────────────────────────────

/**
 * @global
 * Symbol key for signal storage on object instances.
 */
export const signalStorageSymbol = Symbol('signalStorage')

/**
 * @global
 * Symbol key for modifier storage on object instances.
 */
export const modifierStorageSymbol = Symbol('modifierStorage')

// ─── Types ────────────────────────────────────────────────────────

/**
 * @global
 * Storage map: property key → SolidJS signal.
 */
type SignalStorage = Map<PropertyKey, ReturnType<typeof createSignal<unknown>>>

/**
 * @global
 * Modifier enum — controls sync direction for share system.
 */
export enum Modifier {
    /** Server → Client only (default). Client cannot modify. */
    READ = 0,
    /** Bidirectional sync. Client can send updates to server. */
    WRITE = 1,
    /**
     * Excluded from sync and serialization entirely.
     */
    SECRET = 2,
}

/**
 * @global
 * Type unwrapper.
 */
export interface TypeWithModifier<T = unknown> {
    [modifierSymbol]: Modifier
    [typeSymbol]: T
}

/**
 * @global
 * Shared interface — marks objects that are registered in define system.
 */
export interface Shared {
    [idSymbol]?: number
    [rawSetterSymbol]?: Record<PropertyKey, (value: unknown) => void>
    [signalStorageSymbol]?: SignalStorage
    [modifierStorageSymbol]?: Record<PropertyKey, Modifier>
}

/**
 * @global
 * Unwraps a potentially modifier-wrapped type to get the raw schema and modifier.
 *
 * @param schema - Schema to unwrap.
 * @returns Unwrapped type and modifier.
 */
export function unwrapType<T>(schema: T): { type: unknown; modifier: Modifier } {
    if (schema != null && typeof schema === 'object' && modifierSymbol in schema) {
        const wrapped = schema as unknown as TypeWithModifier
        return {
            type: wrapped[typeSymbol],
            modifier: wrapped[modifierSymbol],
        }
    }

    return { type: schema, modifier: Modifier.READ }
}

// ─── Signal helpers ───────────────────────────────────────────────

/**
 * @global
 * Get or create a signal for a property on an object instance.
 *
 * @param instance - Object instance.
 * @param key - Property key.
 * @returns Signal for property.
 */
function getOrCreateSignal(
    instance: Record<symbol, unknown>,
    key: PropertyKey
): ReturnType<typeof createSignal<unknown>> {
    let storage = instance[signalStorageSymbol] as SignalStorage | undefined

    if (!storage) {
        storage = new Map()
        instance[signalStorageSymbol] = storage
    }

    let signal = storage.get(key)

    if (!signal) {
        signal = createSignal<unknown>(undefined)
        storage.set(key, signal)

        // Register raw setter
        if (!instance[rawSetterSymbol]) {
            instance[rawSetterSymbol] = {}
        }

        const [, setter] = signal
        ;(instance[rawSetterSymbol] as Record<PropertyKey, (value: unknown) => void>)[key] = setter
    }

    return signal
}

/**
 * Get the raw value from a signal without triggering reactive reads.
 */
function getRaw(instance: Record<symbol, unknown>, key: PropertyKey): unknown {
    const storage = instance[signalStorageSymbol] as SignalStorage | undefined

    if (!storage) {
        return undefined
    }

    const signal = storage.get(key)

    if (!signal) {
        return undefined
    }

    return signal[0]()
}

/**
 * Set a value on a signal without going through setter logic.
 */
function setRaw(instance: Record<symbol, unknown>, key: PropertyKey, value: unknown): void {
    const signal = getOrCreateSignal(instance, key)
    signal[1](value)
}

// ─── Property Descriptor ──────────────────────────────────────────

/**
 * Create a reactive property descriptor using SolidJS signals.
 *
 * @param wrappedSchema - Schema type (possibly wrapped with modifier)
 * @param key - Property key
 * @param _index - Property index in schema for serialization
 */
export function reactivePropertyDescriptor<T>(wrappedSchema: T, key: PropertyKey, _index: number): PropertyDescriptor {
    const { type: schema, modifier } = unwrapType(wrappedSchema)

    function getter(this: Record<symbol, unknown>): unknown {
        const signal = getOrCreateSignal(this, key)
        return signal[0]() // getter
    }

    function setter(this: Record<symbol, unknown>, value: unknown): void {
        // Store modifier for this property
        let modStorage = this[modifierStorageSymbol] as Record<PropertyKey, Modifier> | undefined

        if (!modStorage) {
            modStorage = {}
            this[modifierStorageSymbol] = modStorage
        }

        modStorage[key] = modifier

        // Set the signal value
        const signal = getOrCreateSignal(this, key)
        signal[1](value)

        // Notify change listener (used by SignalLamp)
        const listener = this[CHANGE_LISTENER] as
            | ((key: PropertyKey, value: unknown, rawValue: unknown) => void)
            | Set<(key: PropertyKey, value: unknown, rawValue: unknown) => void>
            | undefined
        if (typeof listener === 'function') {
            listener(key, value, value)
        } else if (listener instanceof Set) {
            for (const fn of listener) {
                fn(key, value, value)
            }
        }
    }

    function setArrayOrObject(this: Record<symbol, unknown>, value: unknown): void {
        // For non-object values, delegate to primitive setter
        if (typeof value !== 'object' || value === null) {
            setter.call(this, value)
            return
        }

        // For objects, wrap if needed (apply schema constructor)
        let object = value

        if (typeof schema === 'function' && schema.prototype?.constructor !== Object && !(value instanceof Object)) {
            const Constructor = schema as new (value: unknown) => object
            object = new Constructor(value)
        }

        setter.call(this, object)
    }

    // Choose setter based on schema type
    if (schema == null) {
        return {
            get: getter,
            set: setArrayOrObject,
            enumerable: true,
            configurable: true,
        }
    }

    if (Array.isArray(schema)) {
        // Array type — schema is the element type
        return {
            get: getter,
            set: setArrayOrObject,
            enumerable: true,
            configurable: true,
        }
    }

    if (typeof schema === 'object' || typeof schema === 'function') {
        // Object or class type
        return {
            get: getter,
            set: setArrayOrObject,
            enumerable: true,
            configurable: true,
        }
    }

    // Primitive type
    return {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true,
    }
}

/**
 * Create a map of reactive property descriptors from a schema object.
 */
export function reactivePropertyDescriptorMap<T extends object>(schema: T): Record<PropertyKey, PropertyDescriptor> {
    const map: Record<PropertyKey, PropertyDescriptor> = {}
    let index = 0

    for (const [key, schemaType] of Object.entries(schema)) {
        map[key] = reactivePropertyDescriptor(schemaType, key, index++)
    }

    return map
}

/**
 * Extract the raw value from a signal without triggering reactive reads.
 * Useful for serialization.
 */
export function getSignalValue<T extends Record<symbol, unknown>>(obj: T, key: PropertyKey): unknown {
    return getRaw(obj, key)
}

/**
 * Set a value directly on the signal without going through property descriptor.
 * Useful for `rawSet()` functionality — set without listener notification.
 */
export function setSignalValue<T extends Record<symbol, unknown>>(obj: T, key: PropertyKey, value: unknown): void {
    setRaw(obj, key, value)
}

/**
 * Register the reactive property descriptor as the hook in @sky-modules/define.
 * After this call, all schema decorators (@number, @string, etc.) will create
 * reactive properties with SolidJS signals instead of simple get/set.
 *
 * Call this once during application startup.
 */
export function registerReactiveHook(): void {
    registerPropertyDescriptorHook(reactivePropertyDescriptor)
}
