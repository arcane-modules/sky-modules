import { describe, expect, test } from 'vitest'
import pipe, { flow, identity } from './pipe'

describe('pipe', () => {
    test('returns value with no functions', () => {
        expect(pipe(42)).toBe(42)
    })

    test('pipes through single function', () => {
        const result = pipe(5, (x: number) => x * 2)
        expect(result).toBe(10)
    })

    test('pipes through multiple functions', () => {
        const result = pipe(
            5,
            (x: number) => x * 2,
            (x: number) => x + 1,
            (x: number) => x.toString()
        )
        expect(result).toBe('11')
    })
})

describe('flow', () => {
    test('creates composed function', () => {
        const add1 = (x: number) => x + 1
        const double = (x: number) => x * 2
        const fn = flow(add1, double)
        expect(fn(5)).toBe(12)
    })
})

describe('identity', () => {
    test('returns same value', () => {
        expect(identity(42)).toBe(42)
        expect(identity('hello')).toBe('hello')
    })
})
