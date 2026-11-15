import { describe, expect, test, vi } from 'vitest'
import { switchThread } from './switchThread'
import { measurePerformance } from './measurePerformance'

describe('switchThread', () => {
    test('resolves immediately', async () => {
        await switchThread()
        expect(true).toBe(true)
    })
})

describe('measurePerformance', () => {
    test('outputs results to console', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

        measurePerformance(10, 2, [
            [
                'A',
                () => {
                    /* noop */
                },
            ],
            [
                'B',
                () => {
                    /* noop */
                },
            ],
        ])

        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})
