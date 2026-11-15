/**
 * Tests for JSX runtime.
 */

import { describe, expect, test } from 'vitest'
import { jsx, jsxs, Fragment } from './jsx-runtime'

describe('jsx-runtime', () => {
    test('jsx creates element object', () => {
        const element = jsx('div', { className: 'box', children: 'Hello' })
        expect(element).toEqual({
            type: 'div',
            props: { className: 'box', children: 'Hello' },
        })
    })

    test('jsxs creates element object', () => {
        const element = jsxs('span', { children: ['a', 'b'] })
        expect(element).toEqual({
            type: 'span',
            props: { children: ['a', 'b'] },
        })
    })

    test('Fragment is exported', () => {
        expect(Fragment).toBe('Fragment')
    })
})
