import { primitiveTypeSymbol, schemaSymbol, validationRulesSymbol } from './internal/symbols'

// ─── Types ───────────────────────────────────────────────────────

/** A single validation rule */
export interface ValidationRule {
    type: string
    value?: unknown
    message: string
}

/** Validation error for a single field */
export interface FieldError {
    path: string
    message: string
    rule: string
}

/** Batch validation result */
export interface ValidationResult {
    valid: boolean
    errors: FieldError[]
}

/** Any function value, used as the subject of function validators */
type AnyFunction = (...args: unknown[]) => unknown

/** Custom validation function */
export type ValidatorFn<T = unknown> = (value: T) => boolean

// ─── Extension Registry ───────────────────────────────────────────

const stringExtensions = new Map<string, { fn: ValidatorFn<string>; message: string }>()
const numberExtensions = new Map<string, { fn: ValidatorFn<number>; message: string }>()
const arrayExtensions = new Map<string, { fn: ValidatorFn<unknown[]>; message: string }>()
const objectExtensions = new Map<string, { fn: ValidatorFn<object>; message: string }>()
const funcExtensions = new Map<string, { fn: ValidatorFn<AnyFunction>; message: string }>()

// ─── Validator Builders ───────────────────────────────────────────

/**
 * String-specific validator builder.
 * Provides chainable validation methods for string properties.
 */
export class StringValidatorBuilder {
    rules: ValidationRule[] = []
    schemaType: unknown
    primitiveType = 'string'

    constructor(schemaType: unknown) {
        this.schemaType = schemaType
    }

    min(value: number, message?: string): this {
        this.rules.push({ type: 'min', value, message: message ?? `Minimum length is ${value}` })
        return this
    }

    max(value: number, message?: string): this {
        this.rules.push({ type: 'max', value, message: message ?? `Maximum length is ${value}` })
        return this
    }

    pattern(regex: RegExp, message?: string): this {
        this.rules.push({ type: 'pattern', value: regex, message: message ?? `Must match pattern ${regex}` })
        return this
    }

    email(message?: string): this {
        return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message ?? 'Invalid email format')
    }

    url(message?: string): this {
        return this.pattern(/^https?:\/\/.+/, message ?? 'Invalid URL format')
    }

    uuid(message?: string): this {
        return this.pattern(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            message ?? 'Invalid UUID format'
        )
    }

    nonEmpty(message?: string): this {
        return this.min(1, message ?? 'Cannot be empty')
    }

    refine(fn: ValidatorFn<string>, message: string): this {
        this.rules.push({ type: 'refine', value: fn, message })
        return this
    }

    use(name: string): this {
        const ext = stringExtensions.get(name)

        if (!ext) {
            throw new Error(`String extension '${name}' not found`)
        }

        return this.refine(ext.fn, ext.message)
    }
}

/**
 * Number-specific validator builder.
 * Provides chainable validation methods for number properties.
 */
export class NumberValidatorBuilder {
    rules: ValidationRule[] = []
    schemaType: unknown
    primitiveType = 'number'

    constructor(schemaType: unknown) {
        this.schemaType = schemaType
    }

    min(value: number, message?: string): this {
        this.rules.push({ type: 'min', value, message: message ?? `Minimum value is ${value}` })
        return this
    }

    max(value: number, message?: string): this {
        this.rules.push({ type: 'max', value, message: message ?? `Maximum value is ${value}` })
        return this
    }

    integer(message?: string): this {
        return this.refine((val) => Number.isInteger(val), message ?? 'Must be an integer')
    }

    positive(message?: string): this {
        return this.refine((val) => val > 0, message ?? 'Must be positive')
    }

    negative(message?: string): this {
        return this.refine((val) => val < 0, message ?? 'Must be negative')
    }

    nonNegative(message?: string): this {
        return this.refine((val) => val >= 0, message ?? 'Must be non-negative')
    }

    finite(message?: string): this {
        return this.refine((val) => Number.isFinite(val), message ?? 'Must be finite')
    }

    refine(fn: ValidatorFn<number>, message: string): this {
        this.rules.push({ type: 'refine', value: fn, message })
        return this
    }

    use(name: string): this {
        const ext = numberExtensions.get(name)

        if (!ext) {
            throw new Error(`Number extension '${name}' not found`)
        }

        return this.refine(ext.fn, ext.message)
    }
}

/**
 * Array-specific validator builder.
 * Provides chainable validation methods for array properties.
 */
export class ArrayValidatorBuilder {
    rules: ValidationRule[] = []
    schemaType: unknown
    primitiveType = 'array'
    elementType: unknown

    constructor(schemaType: unknown, elementType: unknown) {
        this.schemaType = schemaType
        this.elementType = elementType
    }

    minLength(value: number, message?: string): this {
        this.rules.push({ type: 'minLength', value, message: message ?? `Minimum length is ${value}` })
        return this
    }

    maxLength(value: number, message?: string): this {
        this.rules.push({ type: 'maxLength', value, message: message ?? `Maximum length is ${value}` })
        return this
    }

    nonEmpty(message?: string): this {
        return this.minLength(1, message ?? 'Array cannot be empty')
    }

    unique(message?: string): this {
        return this.refine((arr) => new Set(arr).size === arr.length, message ?? 'Array elements must be unique')
    }

    refine(fn: ValidatorFn<unknown[]>, message: string): this {
        this.rules.push({ type: 'refine', value: fn, message })
        return this
    }

    use(name: string): this {
        const ext = arrayExtensions.get(name)

        if (!ext) {
            throw new Error(`Array extension '${name}' not found`)
        }

        return this.refine(ext.fn, ext.message)
    }
}

/**
 * Object-specific validator builder.
 */
export class ObjectValidatorBuilder {
    rules: ValidationRule[] = []
    schemaType: unknown
    primitiveType = 'object'
    objectSchema: unknown

    constructor(schemaType: unknown, objectSchema: unknown) {
        this.schemaType = schemaType
        this.objectSchema = objectSchema
    }

    required(message?: string): this {
        this.rules.push({ type: 'required', message: message ?? 'Object is required' })
        return this
    }

    refine(fn: ValidatorFn<object>, message: string): this {
        this.rules.push({ type: 'refine', value: fn, message })
        return this
    }

    use(name: string): this {
        const ext = objectExtensions.get(name)

        if (!ext) {
            throw new Error(`Object extension '${name}' not found`)
        }

        return this.refine(ext.fn, ext.message)
    }
}

/**
 * Func-specific validator builder.
 */
export class FuncValidatorBuilder {
    rules: ValidationRule[] = []
    schemaType: unknown
    primitiveType = 'func'

    constructor(schemaType: unknown) {
        this.schemaType = schemaType
    }

    required(message?: string): this {
        this.rules.push({ type: 'required', message: message ?? 'Function is required' })
        return this
    }

    refine(fn: ValidatorFn<AnyFunction>, message: string): this {
        this.rules.push({ type: 'refine', value: fn, message })
        return this
    }

    use(name: string): this {
        const ext = funcExtensions.get(name)

        if (!ext) {
            throw new Error(`Func extension '${name}' not found`)
        }

        return this.refine(ext.fn, ext.message)
    }
}

// ─── Extension Registration ────────────────────────────────────────

export function extendString(name: string, fn: ValidatorFn<string>, message: string): void {
    stringExtensions.set(name, { fn, message })
}

export function extendNumber(name: string, fn: ValidatorFn<number>, message: string): void {
    numberExtensions.set(name, { fn, message })
}

export function extendArray(name: string, fn: ValidatorFn<unknown[]>, message: string): void {
    arrayExtensions.set(name, { fn, message })
}

export function extendObject(name: string, fn: ValidatorFn<object>, message: string): void {
    objectExtensions.set(name, { fn, message })
}

export function extendFunc(name: string, fn: ValidatorFn<AnyFunction>, message: string): void {
    funcExtensions.set(name, { fn, message })
}

// ─── Validation Logic ─────────────────────────────────────────────

/**
 * Validate a single value against a set of rules.
 */
function validateValue(value: unknown, rules: ValidationRule[], primitiveType: string): string | null {
    for (const rule of rules) {
        switch (rule.type) {
            case 'min':
                if (primitiveType === 'string') {
                    if (typeof value === 'string' && value.length < (rule.value as number)) {
                        return rule.message
                    }
                } else if (typeof value === 'number' && value < (rule.value as number)) {
                    return rule.message
                }
                break

            case 'max':
                if (primitiveType === 'string') {
                    if (typeof value === 'string' && value.length > (rule.value as number)) {
                        return rule.message
                    }
                } else if (typeof value === 'number' && value > (rule.value as number)) {
                    return rule.message
                }
                break

            case 'pattern':
                if (typeof value === 'string' && !(rule.value as RegExp).test(value)) {
                    return rule.message
                }
                break

            case 'minLength':
                if (Array.isArray(value) && value.length < (rule.value as number)) {
                    return rule.message
                }
                break

            case 'maxLength':
                if (Array.isArray(value) && value.length > (rule.value as number)) {
                    return rule.message
                }
                break

            case 'required':
                if (value === null || value === undefined) {
                    return rule.message
                }
                break

            case 'refine':
                if (value !== null && value !== undefined && !(rule.value as ValidatorFn)(value)) {
                    return rule.message
                }
                break
        }
    }

    return null
}

/**
 * Batch validate an object against its schema.
 *
 * @param target - The object to validate (must have schema on prototype)
 * @returns Validation result with errors
 *
 * @example
 * ```ts
 * const result = validate(player)
 * if (!result.valid) {
 *     console.log(result.errors)
 * }
 * ```
 */
export function validate<T extends object>(target: T): ValidationResult {
    const errors: FieldError[] = []
    const proto = Object.getPrototypeOf(target)
    const schema = proto?.[schemaSymbol as unknown as string] as Record<string, unknown> | undefined

    if (!schema) {
        return { valid: true, errors: [] }
    }

    for (const [key, schemaDef] of Object.entries(schema)) {
        if (schemaDef && typeof schemaDef === 'object') {
            const def = schemaDef as {
                type?: unknown
                [validationRulesSymbol]?: ValidationRule[]
                [primitiveTypeSymbol]?: string
            }

            const rules = def[validationRulesSymbol]
            const primitiveType = def[primitiveTypeSymbol]

            if (rules && rules.length > 0 && primitiveType) {
                const value = (target as Record<string, unknown>)[key]
                const error = validateValue(value, rules, primitiveType)

                if (error) {
                    errors.push({
                        path: key,
                        message: error,
                        rule: rules.find((r) => validateValue(value, [r], primitiveType) !== null)?.type ?? 'unknown',
                    })
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

// ─── Factory Functions ─────────────────────────────────────────────

export function createStringValidator(schemaType: unknown): StringValidatorBuilder {
    return new StringValidatorBuilder(schemaType)
}

export function createNumberValidator(schemaType: unknown): NumberValidatorBuilder {
    return new NumberValidatorBuilder(schemaType)
}

export function createArrayValidator(schemaType: unknown, elementType: unknown): ArrayValidatorBuilder {
    return new ArrayValidatorBuilder(schemaType, elementType)
}

export function createObjectValidator(schemaType: unknown, objectSchema: unknown): ObjectValidatorBuilder {
    return new ObjectValidatorBuilder(schemaType, objectSchema)
}

export function createFuncValidator(schemaType: unknown): FuncValidatorBuilder {
    return new FuncValidatorBuilder(schemaType)
}
