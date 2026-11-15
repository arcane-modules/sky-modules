/**
 * Internal symbols for the define/reactive system.
 * Used to store metadata on runtime objects without name collisions.
 */

/** Symbol for storing schema on a prototype */
export const schemaSymbol = Symbol('schema')

/** Symbol for unique instance ID */
export const idSymbol = Symbol('id')

/** Symbol for short name (last segment of dotted name) */
export const nameSymbol = Symbol('name')

/** Symbol for full define UID */
export const uidSymbol = Symbol('uid')

/** Symbol for class type marker */
export const typeSymbol = Symbol('type')

/** Symbol for constructor reference on schemas */
export const constructorSymbol = Symbol('constructor')

/** Symbol for property index in schema (serialization order) */
export const propertyIndexSymbol = Symbol('propertyIndex')

/** Symbol for modifier metadata */
export const modifierSymbol = Symbol('modifier')

/** Symbol for primitive type marker */
export const primitiveTypeSymbol = Symbol('primitiveType')

/** Symbol for raw setter reference */
export const rawSetterSymbol = Symbol('rawSetter')

/** Symbol for validation rules */
export const validationRulesSymbol = Symbol('validationRules')

/**
 * Symbol for change listener callback.
 * Set on an object instance to receive notifications when any reactive property changes.
 * Callback signature: (key: PropertyKey, value: unknown, rawValue: unknown) => void
 */
export const CHANGE_LISTENER = Symbol('changeListener')
