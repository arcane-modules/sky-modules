/**
 * Tests for @sky-modules/reactive — Phase 2: Modifiers + Validation
 */

import { describe, expect, test, beforeEach } from 'vitest'

import define from './define'
import { number, string, boolean, array, object } from './types'
import { read, write, secret } from './modifiers'
import { validate, extendNumber, extendString } from './validation'
import { clearRegistry } from './internal/state'
import { modifierSymbol, typeSymbol } from './internal/symbols'
import { Modifier } from './reactive'

// ─── Cleanup ─────────────────────────────────────────────────────

beforeEach(() => {
    clearRegistry()
})

// ─── Modifiers ────────────────────────────────────────────────────

describe('modifiers', () => {
    test('read() wraps type with READ modifier', () => {
        const wrapped = read(number) as unknown as Record<symbol, unknown>
        expect(wrapped[modifierSymbol]).toBe(Modifier.READ)
        expect(wrapped[typeSymbol]).toBe(number)
    })

    test('write() wraps type with WRITE modifier', () => {
        const wrapped = write(number) as unknown as Record<symbol, unknown>
        expect(wrapped[modifierSymbol]).toBe(Modifier.WRITE)
        expect(wrapped[typeSymbol]).toBe(number)
    })

    test('secret() wraps type with SECRET modifier', () => {
        const wrapped = secret(number) as unknown as Record<symbol, unknown>
        expect(wrapped[modifierSymbol]).toBe(Modifier.SECRET)
        expect(wrapped[typeSymbol]).toBe(number)
    })

    test('modifiers work with all primitive types', () => {
        const r = read(string) as unknown as Record<symbol, unknown>
        expect(r[modifierSymbol]).toBe(Modifier.READ)

        const w = write(boolean) as unknown as Record<symbol, unknown>
        expect(w[modifierSymbol]).toBe(Modifier.WRITE)

        const s = secret(number) as unknown as Record<symbol, unknown>
        expect(s[modifierSymbol]).toBe(Modifier.SECRET)
    })
})

// ─── Number Validation ────────────────────────────────────────────

describe('@number validation', () => {
    test('@number.min(0) validates minimum', () => {
        @define('test.ValidMin')
        class ValidMin {
            @number.min(0) value = 5
        }

        const obj = new ValidMin()
        const result = validate(obj)
        expect(result.valid).toBe(true)

        obj.value = -1
        const result2 = validate(obj)
        expect(result2.valid).toBe(false)
        expect(result2.errors[0]!.rule).toBe('min')
    })

    test('@number.max(100) validates maximum', () => {
        @define('test.ValidMax')
        class ValidMax {
            @number.max(100) value = 50
        }

        const obj = new ValidMax()
        expect(validate(obj).valid).toBe(true)

        obj.value = 200
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.min(0).max(100) chains validators', () => {
        @define('test.ValidRange')
        class ValidRange {
            @(number.min(0).max(100)) value = 50
        }

        const obj = new ValidRange()
        expect(validate(obj).valid).toBe(true)

        obj.value = -1
        expect(validate(obj).valid).toBe(false)

        obj.value = 101
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.integer() validates integer', () => {
        @define('test.ValidInt')
        class ValidInt {
            @number.integer() value = 5
        }

        const obj = new ValidInt()
        expect(validate(obj).valid).toBe(true)

        obj.value = 5.5
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.positive() validates positive', () => {
        @define('test.ValidPos')
        class ValidPos {
            @number.positive() value = 1
        }

        const obj = new ValidPos()
        expect(validate(obj).valid).toBe(true)

        obj.value = 0
        expect(validate(obj).valid).toBe(false)

        obj.value = -1
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.negative() validates negative', () => {
        @define('test.ValidNeg')
        class ValidNeg {
            @number.negative() value = -1
        }

        const obj = new ValidNeg()
        expect(validate(obj).valid).toBe(true)

        obj.value = 0
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.nonNegative() validates non-negative', () => {
        @define('test.ValidNonNeg')
        class ValidNonNeg {
            @number.nonNegative() value = 0
        }

        const obj = new ValidNonNeg()
        expect(validate(obj).valid).toBe(true)

        obj.value = -1
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.finite() validates finite', () => {
        @define('test.ValidFin')
        class ValidFin {
            @number.finite() value = 42
        }

        const obj = new ValidFin()
        expect(validate(obj).valid).toBe(true)

        obj.value = Infinity
        expect(validate(obj).valid).toBe(false)

        obj.value = NaN
        expect(validate(obj).valid).toBe(false)
    })

    test('@number.refine() uses custom validator', () => {
        @define('test.ValidRefine')
        class ValidRefine {
            @number.refine((v) => v % 2 === 0, 'Must be even') value = 2
        }

        const obj = new ValidRefine()
        expect(validate(obj).valid).toBe(true)

        obj.value = 3
        expect(validate(obj).valid).toBe(false)
        expect(validate(obj).errors[0]!.message).toBe('Must be even')
    })
})

// ─── String Validation ───────────────────────────────────────────

describe('@string validation', () => {
    test('@string.email() validates email', () => {
        @define('test.ValidEmail')
        class ValidEmail {
            @string.email() value = 'test@example.com'
        }

        const obj = new ValidEmail()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'not-an-email'
        expect(validate(obj).valid).toBe(false)
    })

    test('@string.nonEmpty() validates non-empty', () => {
        @define('test.ValidNonEmpty')
        class ValidNonEmpty {
            @string.nonEmpty() value = 'hello'
        }

        const obj = new ValidNonEmpty()
        expect(validate(obj).valid).toBe(true)

        obj.value = ''
        expect(validate(obj).valid).toBe(false)
    })

    test('@string.min(2).max(10) chains length validators', () => {
        @define('test.ValidStrLen')
        class ValidStrLen {
            @(string.min(2).max(10)) value = 'hello'
        }

        const obj = new ValidStrLen()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'a'
        expect(validate(obj).valid).toBe(false)

        obj.value = 'toolongstring'
        expect(validate(obj).valid).toBe(false)
    })

    test('@string.pattern() validates regex', () => {
        @define('test.ValidPattern')
        class ValidPattern {
            @string.pattern(/^[A-Z][a-z]+$/) value = 'Hello'
        }

        const obj = new ValidPattern()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'hello'
        expect(validate(obj).valid).toBe(false)
    })

    test('@string.url() validates URL', () => {
        @define('test.ValidUrl')
        class ValidUrl {
            @string.url() value = 'https://example.com'
        }

        const obj = new ValidUrl()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'not-a-url'
        expect(validate(obj).valid).toBe(false)
    })

    test('@string.uuid() validates UUID', () => {
        @define('test.ValidUuid')
        class ValidUuid {
            @string.uuid() value = '550e8400-e29b-41d4-a716-446655440000'
        }

        const obj = new ValidUuid()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'not-a-uuid'
        expect(validate(obj).valid).toBe(false)
    })
})

// ─── Array Validation ─────────────────────────────────────────────

describe('@array validation', () => {
    test('@array(number).minLength(1) validates min length', () => {
        @define('test.ValidArrMin')
        class ValidArrMin {
            @(array(number).minLength(1)) items: number[] = [1]
        }

        const obj = new ValidArrMin()
        expect(validate(obj).valid).toBe(true)

        obj.items = []
        expect(validate(obj).valid).toBe(false)
    })

    test('@array(number).maxLength(3) validates max length', () => {
        @define('test.ValidArrMax')
        class ValidArrMax {
            @(array(number).maxLength(3)) items: number[] = [1, 2]
        }

        const obj = new ValidArrMax()
        expect(validate(obj).valid).toBe(true)

        obj.items = [1, 2, 3, 4]
        expect(validate(obj).valid).toBe(false)
    })

    test('@array(number).nonEmpty() validates non-empty', () => {
        @define('test.ValidArrNonEmpty')
        class ValidArrNonEmpty {
            @(array(number).nonEmpty()) items: number[] = [1]
        }

        const obj = new ValidArrNonEmpty()
        expect(validate(obj).valid).toBe(true)

        obj.items = []
        expect(validate(obj).valid).toBe(false)
    })

    test('@array(number).unique() validates uniqueness', () => {
        @define('test.ValidArrUnique')
        class ValidArrUnique {
            @(array(number).unique()) items: number[] = [1, 2, 3]
        }

        const obj = new ValidArrUnique()
        expect(validate(obj).valid).toBe(true)

        obj.items = [1, 2, 2]
        expect(validate(obj).valid).toBe(false)
    })
})

// ─── Object Validation ────────────────────────────────────────────

describe('@object validation', () => {
    test('@object(Weapon).required() validates required', () => {
        @define('test.ValidObjReq')
        class ValidObjReq {
            @(object(class {}).required()) value: object | null = {}
        }

        const obj = new ValidObjReq()
        expect(validate(obj).valid).toBe(true)

        obj.value = null
        expect(validate(obj).valid).toBe(false)
    })
})

// ─── Multiple validations ─────────────────────────────────────────

describe('multiple validations', () => {
    test('validates multiple fields', () => {
        @define('test.MultiValid')
        class MultiValid {
            @(number.min(0).max(100)) health = 50
            @string.email() email = 'test@example.com'
            @(array(number).minLength(1)) scores: number[] = [10]
        }

        const obj = new MultiValid()
        expect(validate(obj).valid).toBe(true)

        obj.health = -1
        obj.email = 'bad'
        obj.scores = []

        const result = validate(obj)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBe(3)
    })

    test('validate returns field paths in errors', () => {
        @define('test.ErrorPaths')
        class ErrorPaths {
            @number.min(0) a = -1
            @string.nonEmpty() b = ''
        }

        const result = validate(new ErrorPaths())
        expect(result.errors[0]!.path).toBe('a')
        expect(result.errors[1]!.path).toBe('b')
    })
})

// ─── Custom Extensions ────────────────────────────────────────────

describe('custom extensions', () => {
    test('number.extend() registers custom validator', () => {
        extendNumber('even', (v) => v % 2 === 0, 'Must be even')

        @define('test.ExtEven')
        class ExtEven {
            @number.use('even') value = 2
        }

        const obj = new ExtEven()
        expect(validate(obj).valid).toBe(true)

        obj.value = 3
        expect(validate(obj).valid).toBe(false)
        expect(validate(obj).errors[0]!.message).toBe('Must be even')
    })

    test('string.extend() registers custom validator', () => {
        extendString('alphanumeric', (v) => /^[a-zA-Z0-9]+$/.test(v), 'Must be alphanumeric')

        @define('test.ExtAlpha')
        class ExtAlpha {
            @string.use('alphanumeric') value = 'abc123'
        }

        const obj = new ExtAlpha()
        expect(validate(obj).valid).toBe(true)

        obj.value = 'abc-123!'
        expect(validate(obj).valid).toBe(false)
    })
})

// ─── validate() edge cases ────────────────────────────────────────

describe('validate() edge cases', () => {
    test('returns valid for objects without schema', () => {
        const result = validate({})
        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
    })

    test('returns valid for objects without validation rules', () => {
        @define('test.NoRules')
        class NoRules {
            @number value = 42
        }

        const result = validate(new NoRules())
        expect(result.valid).toBe(true)
    })
})
