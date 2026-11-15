import { describe, expect, test } from 'vitest'
import {
    DefineError,
    DuplicateDefineError,
    InvalidDefineNameError,
    RuntimeDefineError,
    RecursiveDefineError,
} from './errors'

describe('DefineError', () => {
    test('creates error with correct name', () => {
        const error = new DefineError('test error')
        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('DefineError')
        expect(error.message).toBe('test error')
    })
})

describe('DuplicateDefineError', () => {
    test('creates error with duplicate message', () => {
        const error = new DuplicateDefineError('app.MyClass')
        expect(error).toBeInstanceOf(DefineError)
        expect(error.message).toBe('Duplicate define: app.MyClass')
    })
})

describe('InvalidDefineNameError', () => {
    test('creates error with invalid name message', () => {
        const error = new InvalidDefineNameError('123invalid')
        expect(error).toBeInstanceOf(DefineError)
        expect(error.message).toContain('123invalid')
        expect(error.message).toContain('Name must match')
    })
})

describe('RuntimeDefineError', () => {
    test('creates error with runtime message', () => {
        const error = new RuntimeDefineError()
        expect(error).toBeInstanceOf(DefineError)
        expect(error.message).toContain('Cannot define at runtime')
    })
})

describe('RecursiveDefineError', () => {
    test('creates error with recursive message', () => {
        const error = new RecursiveDefineError('app.MyClass', ['app.A', 'app.B'])
        expect(error).toBeInstanceOf(DefineError)
        expect(error.message).toContain('app.MyClass')
        expect(error.message).toContain('app.A → app.B')
    })
})
