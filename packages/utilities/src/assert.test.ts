import { describe, expect, test } from 'vitest'
import { assert, AssertionError } from './assert'

describe('assert', () => {
    test('passes with truthy expression', () => {
        expect(() => assert(true, 'should pass')).not.toThrow()
        expect(() => assert(1, 'should pass')).not.toThrow()
        expect(() => assert('hello', 'should pass')).not.toThrow()
    })

    test('throws AssertionError with falsy expression', () => {
        expect(() => assert(false, 'should fail')).toThrow(AssertionError)
        expect(() => assert(0, 'should fail')).toThrow(AssertionError)
        expect(() => assert('', 'should fail')).toThrow(AssertionError)
        expect(() => assert(null, 'should fail')).toThrow(AssertionError)
        expect(() => assert(undefined, 'should fail')).toThrow(AssertionError)
    })

    test('AssertionError has correct message', () => {
        try {
            assert(false, 'custom message')
        } catch (error) {
            expect(error).toBeInstanceOf(AssertionError)
            expect((error as AssertionError).message).toContain('custom message')
        }
    })
})
