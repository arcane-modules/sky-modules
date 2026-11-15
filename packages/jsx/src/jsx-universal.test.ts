/**
 * Tests for universal JSX renderer.
 */

import { describe, expect, test } from 'vitest'
import { createElement, createTextNode, createComponent } from './jsx-universal'

describe('jsx-universal', () => {
    test('createElement returns JSX object for string type', () => {
        const element = createElement('div')
        expect(element).toEqual({ type: 'div', props: {} })
    })

    test('createTextNode returns text node', () => {
        const node = createTextNode('hello')
        expect(node).toEqual({ type: 'text', value: 'hello' })
    })

    test('createComponent calls function component', () => {
        function Button() {
            return createElement('button')
        }

        const result = createComponent(Button, { label: 'Click' })
        expect(result).toEqual({ type: 'button', props: {} })
    })
})
