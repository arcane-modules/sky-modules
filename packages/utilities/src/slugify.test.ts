import { describe, expect, test } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
    test('converts basic text', () => {
        expect(slugify('Hello World')).toBe('hello-world')
    })

    test('handles special characters', () => {
        expect(slugify('Hello World!')).toBe('hello-world')
        expect(slugify('Price: $10.50')).toBe('price-10-50')
    })

    test('transliterates Cyrillic', () => {
        expect(slugify('Привет Мир')).toBe('privet-mir')
    })

    test('handles multiple spaces', () => {
        expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
    })

    test('custom separator', () => {
        expect(slugify('Hello World', { separator: '_' })).toBe('hello_world')
    })

    test('preserves case when lowercase=false', () => {
        expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World')
    })

    test('truncates with maxLength', () => {
        const result = slugify('Very Long Title Here', { maxLength: 10 })
        expect(result.length).toBeLessThanOrEqual(10)
    })

    test('empty string returns empty', () => {
        expect(slugify('')).toBe('')
    })
})
