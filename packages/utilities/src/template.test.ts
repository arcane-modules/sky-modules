import { describe, expect, test } from 'vitest'
import { template } from './template'

describe('template', () => {
    test('replaces simple placeholders', () => {
        expect(template('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!')
    })

    test('replaces multiple placeholders', () => {
        expect(template('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Alice' })).toBe('Hi, Alice!')
    })

    test('handles nested paths', () => {
        const data = {
            user: { name: 'Alice' },
            company: { name: 'Acme' },
        }
        expect(template('{{user.name}} works at {{company.name}}', data)).toBe('Alice works at Acme')
    })

    test('keeps placeholder if value missing', () => {
        expect(template('Hello, {{name}}!', {})).toBe('Hello, {{name}}!')
    })

    test('keeps placeholder if nested path missing', () => {
        expect(template('Value: {{a.b.c}}', { a: {} })).toBe('Value: {{a.b.c}}')
    })

    test('handles null/undefined values', () => {
        expect(template('Hello, {{name}}!', { name: null })).toBe('Hello, {{name}}!')
        expect(template('Hello, {{name}}!', { name: undefined })).toBe('Hello, {{name}}!')
    })

    test('converts value to string', () => {
        expect(template('Count: {{count}}', { count: 42 })).toBe('Count: 42')
    })
})
