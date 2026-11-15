/**
 * @sky-modules/schema
 *
 * Schema type decorators for the define system.
 *
 * Provides decorators (@number, @string, @boolean, etc.) for defining
 * the structure of classes. These decorators use `createPropertyDescriptor`
 * from @sky-modules/define, which is a hook that can be overridden by
 * @sky-modules/reactive to add fine-grained reactivity.
 *
 * @example
 * ```ts
 * import { define } from '@sky-modules/define'
 * import { number, string } from '@sky-modules/schema'
 *
 * @define('game.Player')
 * class Player {
 *     \@number x = 0
 *     \@number y = 0
 *     \@string name = ''
 * }
 * ```
 *
 * @module
 * @global
 * Schema type decorators for defining class structure.
 */

// Type decorators
export {
    boolean,
    number,
    string,
    bigint,
    symbol,
    date,
    object,
    array,
    map,
    set,
    optional,
    nullable,
    nullish,
    read,
    write,
    secret,
    unwrapType,
    Modifier,
    primitiveTypeSymbol,
} from './types'

export type {
    TypeWithModifier,
    objectOf,
    ExtractSchemaType,
    Schema,
    read as ReadType,
    write as WriteType,
    secret as SecretType,
    optional as OptionalType,
    nullable as NullableType,
    nullish as NullishType,
} from './types'

// Plain object utilities
export { makePlain, createPlain, hasSchema, getSchemaKeys } from './plain'
export type { Plain } from './plain'

// Class type
export type { Class } from './Class'
