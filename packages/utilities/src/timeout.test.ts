import { describe, expect, test } from 'vitest'
import { timeout, TimeoutError } from './timeout'

describe('timeout', () => {
    test('resolves before timeout', async () => {
        const result = await timeout(Promise.resolve('ok'), 1000)
        expect(result).toBe('ok')
    })

    test('rejects with TimeoutError on timeout', async () => {
        const slow = new Promise((r) => setTimeout(r, 1000))
        await expect(timeout(slow, 10)).rejects.toThrow(TimeoutError)
    })

    test('rejects with original error', async () => {
        const fail = Promise.reject(new Error('original'))
        await expect(timeout(fail, 1000)).rejects.toThrow('original')
    })

    test('TimeoutError has correct name', () => {
        const err = new TimeoutError(500)
        expect(err.name).toBe('TimeoutError')
        expect(err.message).toContain('500')
    })
})
