/**
 * Tests for Box component
 */

import { describe, expect, test } from 'vitest'
import { Box } from './Box'

describe('Box', () => {
    test('renders with default props', () => {
        const element = Box({ children: 'Content' })
        expect(element).toBeTruthy()
    })

    test('renders as button', () => {
        const element = Box({ as: 'button' as never, children: 'Click' })
        expect(element).toBeTruthy()
    })

    test('renders with padding', () => {
        const element = Box({ padding: '4', children: 'Content' })
        expect(element).toBeTruthy()
    })
})
