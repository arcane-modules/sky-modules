/**
 * Reactive type decorators.
 *
 * Re-exports decorators from @sky-modules/schema and adds chainable validation.
 * When imported, registers the reactive property descriptor hook so that
 * schema decorators create reactive properties with SolidJS signals.
 *
 * @example
 * ```ts
 * import { number, string } from '@sky-modules/reactive'
 *
 * class Player {
 *     \@number.min(0).max(100) health = 100
 *     \@string.email().nonEmpty() email = ''
 * }
 * ```
 */

import {
    number as schemaNumber,
    string as schemaString,
    boolean as schemaBoolean,
    bigint as schemaBigint,
    symbol as schemaSymbolDecorator,
    date as schemaDate,
    object as schemaObject,
    array as schemaArray,
    map as schemaMap,
    set as schemaSet,
    optional as schemaOptional,
    nullable as schemaNullable,
    nullish as schemaNullish,
    read as schemaRead,
    write as schemaWrite,
    secret as schemaSecret,
} from '@sky-modules/schema'

import {
    createStringValidator,
    createNumberValidator,
    createArrayValidator,
    createObjectValidator,
    extendString,
    extendNumber,
    type ValidationRule,
    type StringValidatorBuilder,
    type NumberValidatorBuilder,
    type ArrayValidatorBuilder,
    type ObjectValidatorBuilder,
} from './validation'

import { registerReactiveHook } from './reactive'

import { createPropertyDescriptor } from '@sky-modules/define'
import { schemaSymbol, propertyIndexSymbol, validationRulesSymbol, primitiveTypeSymbol } from './internal/symbols'

// Register the reactive hook immediately so schema decorators use signals
registerReactiveHook()

// ─── Helper ───────────────────────────────────────────────────────

/**
 * Create a decorator from a builder's state.
 * The returned function is both callable (as a decorator) AND has
 * the builder's chainable methods via prototype.
 */
function createDecoratorFromBuilder(
    rules: ValidationRule[],
    schemaType: unknown,
    primitiveType: string,
    builder: object
): PropertyDecorator {
    const decorator = (target: object, key: PropertyKey): void => {
        // Store validation rules on the prototype
        const proto = target as Record<symbol, unknown>

        const existingSchema = proto[schemaSymbol] as Record<PropertyKey, unknown> | undefined
        proto[schemaSymbol] = existingSchema ?? {}

        // Store schema with validation rules
        ;(proto[schemaSymbol] as Record<PropertyKey, unknown>)[key] = {
            type: schemaType,
            [validationRulesSymbol]: rules,
            [primitiveTypeSymbol]: primitiveType,
        }

        // Track property index
        const existingIndex = proto[propertyIndexSymbol] as number | undefined
        proto[propertyIndexSymbol] = existingIndex ?? 0
        const index = proto[propertyIndexSymbol] as number

        // Create property descriptor via the reactive hook
        // The hook is already registered, so this creates reactive properties
        Object.defineProperty(target, key, createPropertyDescriptor(schemaType, key, index))

        proto[propertyIndexSymbol] = index + 1
    }

    // Set prototype to builder's prototype so chainable methods are available
    Object.setPrototypeOf(decorator, Object.getPrototypeOf(builder))

    // Copy builder state to decorator
    ;(decorator as unknown as { rules: ValidationRule[] }).rules = rules
    ;(decorator as unknown as { schemaType: unknown }).schemaType = schemaType
    ;(decorator as unknown as { primitiveType: string }).primitiveType = primitiveType

    return decorator
}

// ─── Re-exported decorators with validation ──────────────────────

/**
 * @global
 * Decorator for defining a **boolean** reactive property.
 */
export const boolean = schemaBoolean as typeof schemaBoolean

/**
 * @global
 * Decorator for defining a **number** reactive property with chainable validation.
 *
 * @example
 * ```ts
 * \@number.min(0).max(100) health = 100
 * \@number.integer() count = 0
 * ```
 */
export const number = Object.assign(schemaNumber, {
    min: (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).min(value, message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).min(value, message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    max: (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).max(value, message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).max(value, message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    integer: (message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).integer(message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).integer(message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    positive: (message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).positive(message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).positive(message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    negative: (message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).negative(message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).negative(message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    nonNegative: (message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).nonNegative(message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).nonNegative(message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    finite: (message?: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).finite(message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).finite(message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    refine: (fn: (value: number) => boolean, message: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).refine(fn, message).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).refine(fn, message)
        ) as NumberValidatorBuilder & PropertyDecorator,

    use: (name: string) =>
        createDecoratorFromBuilder(
            createNumberValidator(schemaNumber).use(name).rules,
            schemaNumber,
            'number',
            createNumberValidator(schemaNumber).use(name)
        ) as NumberValidatorBuilder & PropertyDecorator,

    extend: extendNumber,
}) as unknown as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: number
    [primitiveTypeSymbol]: string
} & NumberChainable

interface NumberChainable {
    min(value: number, message?: string): NumberValidatorBuilder & PropertyDecorator
    max(value: number, message?: string): NumberValidatorBuilder & PropertyDecorator
    integer(message?: string): NumberValidatorBuilder & PropertyDecorator
    positive(message?: string): NumberValidatorBuilder & PropertyDecorator
    negative(message?: string): NumberValidatorBuilder & PropertyDecorator
    nonNegative(message?: string): NumberValidatorBuilder & PropertyDecorator
    finite(message?: string): NumberValidatorBuilder & PropertyDecorator
    refine(fn: (value: number) => boolean, message: string): NumberValidatorBuilder & PropertyDecorator
    use(name: string): NumberValidatorBuilder & PropertyDecorator
    extend(name: string, fn: (value: number) => boolean, message: string): void
}

/**
 * @global
 * Decorator for defining a **string** reactive property with chainable validation.
 *
 * @example
 * ```ts
 * \@string.email() email = ''
 * \@string.nonEmpty() name = ''
 * \@string.min(2).max(50) username = ''
 * ```
 */
export const string = Object.assign(schemaString, {
    min: (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).min(value, message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).min(value, message)
        ) as StringValidatorBuilder & PropertyDecorator,

    max: (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).max(value, message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).max(value, message)
        ) as StringValidatorBuilder & PropertyDecorator,

    pattern: (regex: RegExp, message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).pattern(regex, message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).pattern(regex, message)
        ) as StringValidatorBuilder & PropertyDecorator,

    email: (message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).email(message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).email(message)
        ) as StringValidatorBuilder & PropertyDecorator,

    url: (message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).url(message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).url(message)
        ) as StringValidatorBuilder & PropertyDecorator,

    uuid: (message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).uuid(message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).uuid(message)
        ) as StringValidatorBuilder & PropertyDecorator,

    nonEmpty: (message?: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).nonEmpty(message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).nonEmpty(message)
        ) as StringValidatorBuilder & PropertyDecorator,

    refine: (fn: (value: string) => boolean, message: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).refine(fn, message).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).refine(fn, message)
        ) as StringValidatorBuilder & PropertyDecorator,

    use: (name: string) =>
        createDecoratorFromBuilder(
            createStringValidator(schemaString).use(name).rules,
            schemaString,
            'string',
            createStringValidator(schemaString).use(name)
        ) as StringValidatorBuilder & PropertyDecorator,

    extend: extendString,
}) as unknown as (<T extends PropertyKey>(target: object, key: T) => void) & {
    readonly type: string
    [primitiveTypeSymbol]: string
} & StringChainable

interface StringChainable {
    min(value: number, message?: string): StringValidatorBuilder & PropertyDecorator
    max(value: number, message?: string): StringValidatorBuilder & PropertyDecorator
    pattern(regex: RegExp, message?: string): StringValidatorBuilder & PropertyDecorator
    email(message?: string): StringValidatorBuilder & PropertyDecorator
    url(message?: string): StringValidatorBuilder & PropertyDecorator
    uuid(message?: string): StringValidatorBuilder & PropertyDecorator
    nonEmpty(message?: string): StringValidatorBuilder & PropertyDecorator
    refine(fn: (value: string) => boolean, message: string): StringValidatorBuilder & PropertyDecorator
    use(name: string): StringValidatorBuilder & PropertyDecorator
    extend(name: string, fn: (value: string) => boolean, message: string): void
}

/**
 * @global
 * Decorator for defining a **bigint** reactive property.
 */
export const bigint = schemaBigint as typeof schemaBigint

/**
 * @global
 * Decorator for defining a **symbol** reactive property.
 */
export const symbol = schemaSymbolDecorator as typeof schemaSymbolDecorator

/**
 * @global
 * Decorator for defining a **Date** reactive property.
 */
export const date = schemaDate as typeof schemaDate

// ─── Arrays ──────────────────────────────────────────────────────

/**
 * @global
 * Creates a decorator for defining an **array** reactive property with chainable validation.
 *
 * @example
 * ```ts
 * \@array(string) members: string[]
 * \@array(number).minLength(1).unique() scores = []
 * ```
 */
export function array<T>(elementType: T): (<K extends PropertyKey>(target: object, key: K) => void) & ArrayChainable {
    const baseDecorator = schemaArray(elementType)

    const chainable = baseDecorator as (<K extends PropertyKey>(target: object, key: K) => void) & ArrayChainable

    chainable.minLength = (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).minLength(value, message).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).minLength(value, message)
        ) as ArrayValidatorBuilder & PropertyDecorator

    chainable.maxLength = (value: number, message?: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).maxLength(value, message).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).maxLength(value, message)
        ) as ArrayValidatorBuilder & PropertyDecorator

    chainable.nonEmpty = (message?: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).nonEmpty(message).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).nonEmpty(message)
        ) as ArrayValidatorBuilder & PropertyDecorator

    chainable.unique = (message?: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).unique(message).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).unique(message)
        ) as ArrayValidatorBuilder & PropertyDecorator

    chainable.refine = (fn: (value: unknown[]) => boolean, message: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).refine(fn, message).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).refine(fn, message)
        ) as ArrayValidatorBuilder & PropertyDecorator

    chainable.use = (name: string) =>
        createDecoratorFromBuilder(
            createArrayValidator(schemaArray, elementType).use(name).rules,
            schemaArray,
            'array',
            createArrayValidator(schemaArray, elementType).use(name)
        ) as ArrayValidatorBuilder & PropertyDecorator

    return chainable
}

interface ArrayChainable {
    minLength(value: number, message?: string): ArrayValidatorBuilder & PropertyDecorator
    maxLength(value: number, message?: string): ArrayValidatorBuilder & PropertyDecorator
    nonEmpty(message?: string): ArrayValidatorBuilder & PropertyDecorator
    unique(message?: string): ArrayValidatorBuilder & PropertyDecorator
    refine(fn: (value: unknown[]) => boolean, message: string): ArrayValidatorBuilder & PropertyDecorator
    use(name: string): ArrayValidatorBuilder & PropertyDecorator
}

// ─── Objects ─────────────────────────────────────────────────────

/**
 * @global
 * Creates a decorator for defining an **object/class** reactive property with chainable validation.
 *
 * @example
 * ```ts
 * \@object(Weapon) weapon: Weapon | null = null
 * \@object(Address).required() address: Address
 * ```
 */
export function object<T extends new (...args: unknown[]) => object | object>(
    schema: T
): (<K extends PropertyKey>(target: object, key: K) => void) & ObjectChainable {
    const baseDecorator = schemaObject(schema)

    const chainable = baseDecorator as (<K extends PropertyKey>(target: object, key: K) => void) & ObjectChainable

    chainable.required = (message?: string) =>
        createDecoratorFromBuilder(
            createObjectValidator(schemaObject, schema).required(message).rules,
            schemaObject,
            'object',
            createObjectValidator(schemaObject, schema).required(message)
        ) as ObjectValidatorBuilder & PropertyDecorator

    chainable.refine = (fn: (value: object) => boolean, message: string) =>
        createDecoratorFromBuilder(
            createObjectValidator(schemaObject, schema).refine(fn, message).rules,
            schemaObject,
            'object',
            createObjectValidator(schemaObject, schema).refine(fn, message)
        ) as ObjectValidatorBuilder & PropertyDecorator

    chainable.use = (name: string) =>
        createDecoratorFromBuilder(
            createObjectValidator(schemaObject, schema).use(name).rules,
            schemaObject,
            'object',
            createObjectValidator(schemaObject, schema).use(name)
        ) as ObjectValidatorBuilder & PropertyDecorator

    return chainable
}

interface ObjectChainable {
    required(message?: string): ObjectValidatorBuilder & PropertyDecorator
    refine(fn: (value: object) => boolean, message: string): ObjectValidatorBuilder & PropertyDecorator
    use(name: string): ObjectValidatorBuilder & PropertyDecorator
}

// ─── Re-export remaining schema exports ─────────────────────────

export { schemaOptional as optional, schemaNullable as nullable, schemaNullish as nullish }
export { schemaRead as read, schemaWrite as write, schemaSecret as secret }
export { schemaMap as map, schemaSet as set }

// Re-export types from schema
export type { ExtractSchemaType, Schema } from '@sky-modules/schema'
