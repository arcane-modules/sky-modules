import { describe, expect, test } from 'vitest'
import { sleep } from './sleep'

describe('sleep', () => {
    test('resolves after specified time', async () => {
        const start = Date.now()
        await sleep(30)
        const elapsed = Date.now() - start
        expect(elapsed).toBeGreaterThanOrEqual(15)
    })

    test('resolves with 0ms', async () => {
        await sleep(0)
        expect(true).toBe(true)
    })
})
