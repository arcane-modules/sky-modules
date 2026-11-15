import { describe, expect, test } from 'vitest'
import { justTry } from './justTry'

describe('justTry', () => {
    test('returns result on success', async () => {
        const result = await justTry(() => 42)
        expect(result).toBe(42)
    })

    test('returns undefined on error', async () => {
        const result = await justTry(() => {
            throw new Error('fail')
        })
        expect(result).toBeUndefined()
    })

    test('handles async functions', async () => {
        const result = await justTry(async () => {
            return 'ok'
        })
        expect(result).toBe('ok')
    })
})
