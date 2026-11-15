/**
 * Tests for PandaBox component
 */

import { describe, expect, test } from 'vitest'
import { PandaBox } from './PandaBox'

describe('PandaBox', () => {
    test('renders with Panda props', () => {
        const element = PandaBox({ bg: 'primary.500', p: '4', children: 'Content' })
        expect(element).toBeTruthy()
    })

    test('renders with flex display', () => {
        const element = PandaBox({ display: 'flex', flexDirection: 'row', gap: '4', children: 'Content' })
        expect(element).toBeTruthy()
    })

    test('renders with rounded corners', () => {
        const element = PandaBox({ rounded: 'md', children: 'Content' })
        expect(element).toBeTruthy()
    })
})
