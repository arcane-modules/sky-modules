/**
 * Symbols used throughout the define system.
 */

export const constructorSymbol = Symbol('constructor')
export const idSymbol = Symbol('id')
export const typeSymbol = Symbol('type')
export const nameSymbol = Symbol('name')
export const uidSymbol = Symbol('uid')
export const listenersOfSharedSymbol = Symbol('listenersOfShared')
export const propertyIndexSymbol = Symbol('propertyIndex')
export const modifierSymbol = Symbol('modifier')
export const schemaMetaSymbol = Symbol('schemaMeta')
export const primitiveTypeSymbol = Symbol('primitiveType')
export const isSetStorageSymbol = Symbol('isSetStorage')

/**
 * Symbol for storing schema metadata on class prototypes.
 * Maps property keys to their schema type decorators.
 */
export const schemaSymbol = Symbol('schema')
