import { describe, expect, test } from 'vitest'
import { truncate } from './truncate'

describe('truncate', () => {
    test('returns full text if within length', () => {
        expect(truncate('Hello', 10)).toBe('Hello')
    })

    test('truncates with default suffix', () => {
        expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    test('truncates at word boundary by default', () => {
        expect(truncate('Hello Beautiful World', 15)).toBe('Hello...')
    })

    test('uses custom suffix', () => {
        expect(truncate('Hello World', 8, { suffix: '…', wordBoundary: false })).toBe('Hello W…')
    })

    test('truncates without word boundary', () => {
        expect(truncate('Hello World', 8, { wordBoundary: false })).toBe('Hello...')
    })

    test('returns suffix if length is very small', () => {
        expect(truncate('Hello World', 2)).toBe('..')
    })
})
