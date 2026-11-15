import { describe, expect, test } from 'vitest'
import { retry } from './retry'

describe('retry', () => {
    test('resolves on first attempt', async () => {
        const result = await retry(() => Promise.resolve(42))
        expect(result).toBe(42)
    })

    test('retries on failure and resolves', async () => {
        let attempts = 0
        const result = await retry(
            () => {
                attempts++
                if (attempts < 3) {
                    return Promise.reject(new Error('fail'))
                }
                return Promise.resolve('success')
            },
            { attempts: 5, delay: 10 }
        )
        expect(result).toBe('success')
        expect(attempts).toBe(3)
    })

    test('fails after all attempts', async () => {
        await expect(retry(() => Promise.reject(new Error('always fail')), { attempts: 3, delay: 10 })).rejects.toThrow(
            'always fail'
        )
    })

    test('retryIf filters which errors trigger retry', async () => {
        let attempts = 0
        await expect(
            retry(
                () => {
                    attempts++
                    return Promise.reject(new Error('fatal'))
                },
                {
                    attempts: 3,
                    delay: 10,
                    retryIf: (err) => (err as Error).message === 'retryable',
                }
            )
        ).rejects.toThrow('fatal')
        expect(attempts).toBe(1)
    })

    test('calls onRetry callback', async () => {
        const onRetryCalls: number[] = []

        await expect(
            retry(() => Promise.reject(new Error('fail')), {
                attempts: 3,
                delay: 10,
                onRetry: (_err, attempt) => onRetryCalls.push(attempt),
            })
        ).rejects.toThrow('fail')

        expect(onRetryCalls).toEqual([1, 2])
    })

    test('exponential backoff increases delay', async () => {
        let attempts = 0
        const retryIf = () => true
        const onRetry = () => {}

        await expect(
            retry(
                () => {
                    attempts++
                    return Promise.reject(new Error('fail'))
                },
                { attempts: 4, delay: 10, backoff: 3, retryIf, onRetry }
            )
        ).rejects.toThrow('fail')

        expect(attempts).toBe(4)
    })
})
