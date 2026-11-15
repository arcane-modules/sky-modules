/**
 * Schema type decorators for the define system.
 *
 * These decorators define the structure of a class for serialization.
 * They use `createPropertyDescriptor` from @sky-modules/define, which
 * is a hook that can be overridden by @sky-modules/reactive to add
 * fine-grained reactivity.
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
 */

import {
    createPropertyDescriptor,
    schemaSymbol,
    propertyIndexSymbol,
    primitiveTypeSymbol,
    modifierSymbol,
    typeSymbol,
} from '@sky-modules/define'

export { primitiveTypeSymbol }

import type { Class } from './Class'

// ─── Modifier ────────────────────────────────────────────────────

/**
 * Modifier enum — controls sync direction for share system.
 */
export enum Modifier {
    /** Server → Client only (default). Client cannot modify. */
    READ = 0,
    /** Bidirectional sync. Client can send updates to server. */
    WRITE = 1,
    /** Excluded from sync and serialization entirely. */
    SECRET = 2,
}

/**
 * Type wrapper that preserves the original type while adding modifier metadata.
 */
export interface TypeWithModifier<T = unknown> {
    [modifierSymbol]: Modifier
    [typeSymbol]: T
}

/**
 * @global
 * Extracts the underlying type and modifier from a potentially modified type.
 *
 * @param schema - Schema or modified type to unwrap.
 * @returns Object containing the underlying type and modifier.
 *
 * @example
 * ```ts
 * const unwrapped = unwrapType(@write.string)
 * unwrapped.type // string
 * unwrapped.modifier // Modifier.WRITE
 * ```
 */
export function unwrapType<T>(schema: T): { type: unknown; modifier: Modifier } {
    if (schema != null && typeof schema === 'object' && modifierSymbol in schema) {
        const wrapped = schema as Record<symbol, unknown>
        const mod = wrapped[modifierSymbol] as Modifier | undefined
        return {
            type: wrapped[typeSymbol],
            modifier: mod ?? Modifier.READ,
        }
    }

    return { type: schema, modifier: Modifier.READ }
}

// ─── Helper ───────────────────────────────────────────────────────

/**
 * Create a property decorator for a primitive type.
 */
function primitiveDecorator(typeName: string) {
    const decorator = <T extends PropertyKey>(target: object, key: T): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = decorator

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(target, key, createPropertyDescriptor(decorator, key, index))

        proto[propertyIndexSymbol] = index + 1
    }

    ;(decorator as unknown as Record<symbol, string>)[primitiveTypeSymbol] = typeName

    return decorator
}

/**
 * @global
 * Helper to create a decorator with a modifier.
 * Wraps the schema type with modifier metadata.
 *
 * @param modifier - Modifier to apply (READ, WRITE, or SECRET).
 * @param schemaType - The underlying type (number, string, boolean, etc.).
 * @returns Decorator function with modifier applied.
 *
 * @example
 * ```ts
 * const writeString = createModifiedDecorator(Modifier.WRITE, string)
 * ```
 */
function createModifiedDecorator<T extends PropertyKey>(
    modifier: Modifier,
    schemaType: unknown
): (target: object, key: T) => void {
    const wrappedSchema = {
        [modifierSymbol]: modifier,
        [typeSymbol]: schemaType,
    }

    return (target: object, key: T): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = wrappedSchema

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(target, key, createPropertyDescriptor(wrappedSchema, key, index))

        proto[propertyIndexSymbol] = index + 1
    }
}

// ─── Primitives ──────────────────────────────────────────────────

/**
 * @global
 * Decorator for defining a **boolean** schema property.
 */
export const boolean = primitiveDecorator('boolean') as {
    <T extends PropertyKey>(target: object, key: T): void
    readonly type: boolean
    [primitiveTypeSymbol]: string
}

/**
 * @global
 * Decorator for defining a **number** schema property.
 */
export const number = Object.assign(primitiveDecorator('number'), {
    type: undefined as unknown as number,
}) as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: number
    [primitiveTypeSymbol]: string
}

/**
 * @global
 * Decorator for defining a **string** schema property.
 */
export const string = Object.assign(primitiveDecorator('string'), {
    type: undefined as unknown as string,
}) as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: string
    [primitiveTypeSymbol]: string
}

/**
 * @global
 * Decorator for defining a **bigint** schema property.
 */
export const bigint = Object.assign(primitiveDecorator('bigint'), {
    type: undefined as unknown as bigint,
}) as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: bigint
    [primitiveTypeSymbol]: string
}

/**
 * @global
 * Decorator for defining a **symbol** schema property.
 */
export const symbol = Object.assign(primitiveDecorator('symbol'), {
    type: undefined as unknown as symbol,
}) as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: symbol
    [primitiveTypeSymbol]: string
}

/**
 * @global
 * Decorator for defining a **Date** schema property.
 * Stored as string internally, but typed as Date.
 */
export const date = Object.assign(primitiveDecorator('date'), {
    type: undefined as unknown as Date,
    [primitiveTypeSymbol]: 'date',
}) as <T extends PropertyKey>(target: object, key: T) => void

// ─── Arrays ──────────────────────────────────────────────────────

/**
 * @global
 * Creates a decorator for defining an **array** schema property.
 *
 * @example
 * ```ts
 * @array(string) members: string[]
 * @array(number) scores: number[] = []
 * ```
 */
export function array<T>(elementType: T): <K extends PropertyKey>(target: object, key: K) => void {
    return <K extends PropertyKey>(target: object, key: K): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = elementType

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(target, key, createPropertyDescriptor(elementType, key, index))

        proto[propertyIndexSymbol] = index + 1
    }
}

// ─── Objects ─────────────────────────────────────────────────────

/**
 * @global
 * Creates a decorator for defining an **object/class** schema property.
 *
 * @example
 * ```ts
 * @object(Weapon) weapon: Weapon | null = null
 * @object(Address) address: Address
 * ```
 */
export function object<T extends Class | object>(schema: T): <K extends PropertyKey>(target: object, key: K) => void {
    return <K extends PropertyKey>(target: object, key: K): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = schema

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(target, key, createPropertyDescriptor(schema, key, index))

        proto[propertyIndexSymbol] = index + 1
    }
}

// ─── Map / Set ───────────────────────────────────────────────────

/**
 * @global
 * Creates a decorator for defining a **Map** schema property.
 *
 * @example
 * ```ts
 * @map(string, number) scores: Map<string, number>
 * ```
 */
export function map<K, V>(_keyType: K, _valueType: V): <T extends PropertyKey>(target: object, key: T) => void {
    return <T extends PropertyKey>(target: object, key: T): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = { keyType: _keyType, valueType: _valueType }

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(
            target,
            key,
            createPropertyDescriptor({ keyType: _keyType, valueType: _valueType }, key, index)
        )

        proto[propertyIndexSymbol] = index + 1
    }
}

/**
 * @global
 * Creates a decorator for defining a **Set** schema property.
 *
 * @example
 * ```ts
 * @set(string) tags: Set<string>
 * ```
 */
export function set<V>(_valueType: V): <K extends PropertyKey>(target: object, key: K) => void {
    return <K extends PropertyKey>(target: object, key: K): void => {
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = _valueType

        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        Object.defineProperty(target, key, createPropertyDescriptor(_valueType, key, index))

        proto[propertyIndexSymbol] = index + 1
    }
}

// ─── Modifiers ───────────────────────────────────────────────────

/**
 * @global
 * Marks a schema property as read-only (server → client).
 * This is the DEFAULT behavior.
 *
 * @example
 * ```ts
 * @read.number health = 100
 * ```
 */
export type read<T> = T
export function read<T>(schema: T): read<T> {
    return {
        [modifierSymbol]: Modifier.READ,
        [typeSymbol]: schema,
    } as T
}

/**
 * @global
 * Marks a schema property as writable (bidirectional sync).
 *
 * @param schema - Schema to wrap with write modifier.
 * @returns Schema wrapped with write modifier.
 *
 * @example
 * ```ts
 * @write.number inputX = 0
 * ```
 */
export type write<T> = T

/**
 * @global
 * Marks a schema property as writable (bidirectional sync).
 *
 * @param schema - Schema to wrap with write modifier.
 * @returns Schema wrapped with write modifier.
 *
 * @example
 * ```ts
 * @write.number inputX = 0
 * ```
 */
export function write<T>(schema: T): write<T> {
    return {
        [modifierSymbol]: Modifier.WRITE,
        [typeSymbol]: schema,
    } as T
}

/**
 * @global
 * Marks a schema property as secret (excluded from sync and serialization).
 *
 * @param schema - Schema to wrap with secret modifier.
 * @returns Schema wrapped with secret modifier.
 *
 * @example
 * ```ts
 * @secret.string password = ''
 * ```
 */
export type secret<T> = T

/**
 * @global
 * Marks a schema property as secret (excluded from sync and serialization).
 *
 * @param schema - Schema to wrap with secret modifier.
 * @returns Schema wrapped with secret modifier.
 *
 * @example
 * ```ts
 * @secret.string password = ''
 * ```
 */
export function secret<T>(schema: T): secret<T> {
    return {
        [modifierSymbol]: Modifier.SECRET,
        [typeSymbol]: schema,
    } as T
}

// Modifier decorator shortcuts
read.boolean = createModifiedDecorator(Modifier.READ, boolean)
read.number = createModifiedDecorator(Modifier.READ, number)
read.string = createModifiedDecorator(Modifier.READ, string)
read.bigint = createModifiedDecorator(Modifier.READ, bigint)
read.symbol = createModifiedDecorator(Modifier.READ, symbol)
read.date = createModifiedDecorator(Modifier.READ, date)

write.boolean = createModifiedDecorator(Modifier.WRITE, boolean)
write.number = createModifiedDecorator(Modifier.WRITE, number)
write.string = createModifiedDecorator(Modifier.WRITE, string)
write.bigint = createModifiedDecorator(Modifier.WRITE, bigint)
write.symbol = createModifiedDecorator(Modifier.WRITE, symbol)
write.date = createModifiedDecorator(Modifier.WRITE, date)

secret.boolean = createModifiedDecorator(Modifier.SECRET, boolean)
secret.number = createModifiedDecorator(Modifier.SECRET, number)
secret.string = createModifiedDecorator(Modifier.SECRET, string)
secret.bigint = createModifiedDecorator(Modifier.SECRET, bigint)
secret.symbol = createModifiedDecorator(Modifier.SECRET, symbol)
secret.date = createModifiedDecorator(Modifier.SECRET, date)

// ─── Optional / Nullable / Nullish ──────────────────────────────

/**
 * @global
 * Marks a schema type as optional (allows undefined).
 *
 * @param schema - Schema to make optional.
 * @returns Optional schema type.
 *
 * @example
 * ```ts
 * @optional.string email?: string
 * ```
 */
export type optional<T> = T | undefined

/**
 * @global
 * Marks a schema type as optional (allows undefined).
 *
 * @param schema - Schema to make optional.
 * @returns Optional schema type.
 *
 * @example
 * ```ts
 * @optional.string email?: string
 * ```
 */
export function optional<T>(schema: T): optional<T> {
    return schema as optional<T>
}

optional.boolean = optional(boolean)
optional.number = optional(number)
optional.string = optional(string)
optional.bigint = optional(bigint)
optional.symbol = optional(symbol)
optional.date = optional(date)

/**
 * @global
 * Marks a schema type as nullable (allows null).
 *
 * @param schema - Schema to make nullable.
 * @returns Nullable schema type.
 *
 * @example
 * ```ts
 * @nullable.string avatar: string | null
 * ```
 */
export type nullable<T> = T | null

/**
 * @global
 * Marks a schema type as nullable (allows null).
 *
 * @param schema - Schema to make nullable.
 * @returns Nullable schema type.
 *
 * @example
 * ```ts
 * @nullable.string avatar: string | null
 * ```
 */
export function nullable<T>(schema: T): nullable<T> {
    return schema as nullable<T>
}

nullable.boolean = nullable(boolean)
nullable.number = nullable(number)
nullable.string = nullable(string)
nullable.bigint = nullable(bigint)
nullable.symbol = nullable(symbol)
nullable.date = nullable(date)

/**
 * @global
 * Marks a schema type as nullish (allows null or undefined).
 *
 * @param schema - Schema to make nullish.
 * @returns Nullish schema type.
 *
 * @example
 * ```ts
 * @nullish.string deletedAt: string | null | undefined
 * ```
 */
export type nullish<T> = T | null | undefined

/**
 * @global
 * Marks a schema type as nullish (allows null or undefined).
 *
 * @param schema - Schema to make nullish.
 * @returns Nullish schema type.
 *
 * @example
 * ```ts
 * @nullish.string deletedAt: string | null | undefined
 * ```
 */
export function nullish<T>(schema: T): nullish<T> {
    return schema as nullish<T>
}

nullish.boolean = nullish(boolean)
nullish.number = nullish(number)
nullish.string = nullish(string)
nullish.bigint = nullish(bigint)
nullish.symbol = nullish(symbol)
nullish.date = nullish(date)

// ─── Type Extraction ────────────────────────────────────────────

/**
 * @global
 * Helper to extract the plain type from a schema decorator.
 * Recursively extracts types from decorators, arrays, and objects.
 *
 * @typeParam T - Type to extract schema from.
 * @typeParam U - Extracted plain type.
 *
 * @example
 * ```ts
 * type MyType = ExtractSchemaType<typeof schema>
 * ```
 */
export type ExtractSchemaType<T> = T extends null
    ? null
    : T extends undefined
      ? undefined
      : T extends { readonly type: infer U }
        ? U
        : T extends new (
                ...args: unknown[]
            ) => infer I
          ? I
          : T extends (infer E)[]
            ? ExtractSchemaType<E>[]
            : T extends object
              ? { [K in keyof T]: ExtractSchemaType<T[K]> }
              : T

/**
 * @global
 * Type alias for object schema definitions in Plain<T> inference.
 *
 * @typeParam C - Object schema definition.
 */
export type objectOf<C> = {
    readonly type: ExtractSchemaType<C>
}

/**
 * @global
 * Schema — utility type for defining plain object schemas.
 *
 * @typeParam K - Property key.
 * @typeParam V - Property value type (decorator, object, or constructor).
 */
export type Schema = Record<
    PropertyKey,
    ((target: object, key: PropertyKey) => void) | object | (new (...args: unknown[]) => object)
>
