import { describe, expect, test } from 'vitest'
import { deferred } from './deferred'

describe('deferred', () => {
    test('creates [promise, resolve, reject] tuple', () => {
        const [promise, resolve, reject] = deferred<string>()
        expect(promise).toBeInstanceOf(Promise)
        expect(resolve).toBeInstanceOf(Function)
        expect(reject).toBeInstanceOf(Function)
    })

    test('promise resolves with external resolve', async () => {
        const [promise, resolve] = deferred<string>()
        resolve('done')
        const result = await promise
        expect(result).toBe('done')
    })

    test('promise rejects with external reject', async () => {
        const [promise, , reject] = deferred()
        reject(new Error('fail'))
        await expect(promise).rejects.toThrow('fail')
    })
})
