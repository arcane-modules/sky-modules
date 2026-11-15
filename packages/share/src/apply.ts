/**
 * @sky-modules/share — Apply deltas to local objects.
 *
 * Maintains a registry of shared objects by ID.
 * Applies CREATE, SET, and DESTROY deltas to registered objects.
 */

import { idSymbol, defines } from '@sky-modules/define'
import { deserializeObject } from './serialize'
import type { Delta } from './types'

/**
 * @global
 * Registry of shared objects by instance ID.
 */
const objectRegistry = new Map<number, object>()

/**
 * @global
 * Register an object in the registry.
 * Assigns an instance ID if not already present.
 *
 * @param obj - Object to register.
 * @returns The instance ID.
 */
export function registerObject(obj: object): number {
    const objWithSymbols = obj as Record<symbol, unknown>

    // Get or assign instance ID
    let instanceId = objWithSymbols[idSymbol] as number | undefined
    if (instanceId == null) {
        instanceId = nextInstanceId()
        objWithSymbols[idSymbol] = instanceId
    }

    objectRegistry.set(instanceId, obj)
    return instanceId
}

/**
 * @global
 * Unregister an object from the registry.
 *
 * @param obj - Object to unregister.
 */
export function unregisterObject(obj: object): void {
    const instanceId = (obj as Record<symbol, unknown>)[idSymbol] as number | undefined
    if (instanceId != null) {
        objectRegistry.delete(instanceId)
    }
}

/**
 * @global
 * Get a registered object by its instance ID.
 *
 * @param id - Instance ID.
 * @returns The registered object, or undefined.
 */
export function getObjectById(id: number): object | undefined {
    return objectRegistry.get(id)
}

/**
 * @global
 * Get all registered objects.
 */
export function getAllObjects(): Map<number, object> {
    return new Map(objectRegistry)
}

/**
 * @global
 * Clear the registry (for testing).
 */
export function clearRegistry(): void {
    objectRegistry.clear()
}

/**
 * @global
 * Apply a delta to the object registry.
 *
 * - CREATE: creates a new instance of the class and registers it
 * - SET: updates properties on an existing object
 * - DESTROY: removes an object from the registry
 *
 * @param delta - The delta to apply.
 * @returns The affected object, or undefined for DESTROY.
 */
export function apply(delta: Delta): object | undefined {
    switch (delta.type) {
        case 'CREATE':
            return applyCreate(delta)

        case 'SET':
            return applySet(delta)

        case 'DESTROY':
            return applyDestroy(delta)
    }
}

/**
 * @global
 * Apply a CREATE delta — instantiate a class and register it.
 *
 * @param delta - CREATE delta containing class, id, and data.
 * @returns Created and registered instance.
 */
function applyCreate(delta: { id: number; class: string; data: Record<string, unknown> }): object {
    const definition = defines[delta.class]

    if (!definition) {
        throw new Error(`Unknown class: ${delta.class}. Make sure it's registered with @define before applying deltas.`)
    }

    const Constructor = definition.value as new () => object
    const instance = new Constructor() as Record<string | symbol, unknown>

    // Set instance ID
    instance[idSymbol] = delta.id

    // Deserialize and apply data
    const deserialized = deserializeObject(delta.data) as Record<string, unknown>
    for (const [key, value] of Object.entries(deserialized)) {
        instance[key] = value
    }

    // Register in registry
    objectRegistry.set(delta.id, instance)

    return instance
}

/**
 * @global
 * Apply a SET delta — update properties on an existing object.
 *
 * @param delta - SET delta containing id and updated data.
 * @returns Updated instance, or undefined if object doesn't exist.
 */
function applySet(delta: { id: number; data: Record<string, unknown> }): object | undefined {
    const instance = objectRegistry.get(delta.id)

    if (!instance) {
        return undefined
    }

    const instanceRecord = instance as Record<string, unknown>
    const deserialized = deserializeObject(delta.data) as Record<string, unknown>

    for (const [key, value] of Object.entries(deserialized)) {
        instanceRecord[key] = value
    }

    return instance
}

/**
 * @global
 * Apply a DESTROY delta — remove an object from the registry.
 *
 * @param delta - DESTROY delta containing object id.
 */
function applyDestroy(delta: { id: number }): undefined {
    objectRegistry.delete(delta.id)
    return undefined
}

/**
 * Counter for generating unique instance IDs.
 */
let idCounter = 1

/**
 * Generate the next unique instance ID.
 *
 * @returns Next unique instance ID.
 */
function nextInstanceId(): number {
    return idCounter++
}

/**
 * Reset the ID counter (for testing).
 */
export function resetIdCounter(): void {
    idCounter = 1
}
