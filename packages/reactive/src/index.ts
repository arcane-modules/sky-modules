/**
 * @sky-modules/reactive — Fine-grained reactive system
 *
 * Provides:
 * - Reactive property decorators with chainable validation
 * - Network lamps: isolated sync units
 * - Reactive arrays with change tracking
 *
 * When imported, automatically registers the reactive property descriptor
 * hook so that @sky-modules/schema decorators create reactive properties
 * with SolidJS signals.
 *
 * @example
 * ```ts
 * import { number, string, SignalLamp } from '@sky-modules/reactive'
 *
 * class Player {
 *     \@number.min(0).max(100) health = 100
 *     \@string.nonEmpty() name = ''
 *     lamp = new SignalLamp(this)
 * }
 * ```
 */

// Register reactive hook immediately
export { registerReactiveHook } from './reactive'

// Reactive signals
export {
    reactivePropertyDescriptor,
    reactivePropertyDescriptorMap,
    unwrapType,
    getSignalValue,
    setSignalValue,
    Modifier,
} from './reactive'
export type { Shared, TypeWithModifier } from './reactive'

// Type decorators with validation chains
export {
    number,
    string,
    boolean,
    bigint,
    symbol,
    date,
    array,
    object,
    map,
    set,
    optional,
    nullable,
    nullish,
    read,
    write,
    secret,
} from './types'
export type { ExtractSchemaType, Schema } from './types'

// Validation
export { validate } from './validation'
export type { ValidationResult, FieldError, ValidationRule, ValidatorFn } from './validation'
export {
    extendString,
    extendNumber,
    extendArray,
    extendObject,
    extendFunc,
} from './validation'

// Lamps — isolated reactive state units
export { SignalLamp, signal, getRawValue, isSignal, reactiveArray } from './lamps'
export type { SyncCallback, ReactiveArray, ArrayChangeEvent, ArrayChangeCallback } from './lamps'

// Internal symbols (for advanced use)
export {
    idSymbol,
    uidSymbol,
    nameSymbol,
    typeSymbol,
    schemaSymbol,
    modifierSymbol,
    primitiveTypeSymbol,
    propertyIndexSymbol,
    rawSetterSymbol,
    validationRulesSymbol,
    constructorSymbol,
    CHANGE_LISTENER,
} from './internal/symbols'
