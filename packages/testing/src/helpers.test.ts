import { describe, expect, test } from 'vitest'
import {
    wait,
    waitFor,
    createSpy,
    mockConsole,
    createDeferred,
    flushPromises,
    expectToThrow,
    createSequentialMock,
} from './helpers'

describe('wait', () => {
    test('resolves after specified time', async () => {
        const start = Date.now()
        await wait(50)
        const elapsed = Date.now() - start
        expect(elapsed).toBeGreaterThanOrEqual(40)
    })
})

describe('waitFor', () => {
    test('resolves when condition becomes true', async () => {
        let flag = false
        setTimeout(() => {
            flag = true
        }, 20)
        await expect(waitFor(() => flag, 100, 10)).resolves.toBeUndefined()
    })

    test('throws on timeout', async () => {
        await expect(waitFor(() => false, 50, 10)).rejects.toThrow('Timeout waiting for condition after 50ms')
    })
})

describe('createSpy', () => {
    test('creates a spy function', () => {
        const spy = createSpy()
        spy('a', 1)
        expect(spy).toHaveBeenCalledWith('a', 1)
    })

    test('uses implementation when provided', () => {
        const spy = createSpy((x: number) => x * 2)
        expect(spy(5)).toBe(10)
    })
})

describe('mockConsole', () => {
    test('mutes console methods and restores them', () => {
        const cleanup = mockConsole()

        expect(() => {
            console.log('silent')
            console.warn('silent')
            console.error('silent')
            console.info('silent')
        }).not.toThrow()

        cleanup()

        // After restore, console should work normally
        expect(console.log).toBe(console.log)
    })
})

describe('createDeferred', () => {
    test('creates a deferred promise that can be resolved', async () => {
        const { promise, resolve } = createDeferred<string>()
        resolve('done')
        await expect(promise).resolves.toBe('done')
    })

    test('creates a deferred promise that can be rejected', async () => {
        const { promise, reject } = createDeferred()
        reject(new Error('fail'))
        await expect(promise).rejects.toThrow('fail')
    })
})

describe('flushPromises', () => {
    test('flushes pending promises', async () => {
        let value = 0
        Promise.resolve().then(() => {
            value = 1
        })
        expect(value).toBe(0)
        await flushPromises()
        expect(value).toBe(1)
    })
})

describe('expectToThrow', () => {
    test('catches thrown error', async () => {
        const error = await expectToThrow(() => {
            throw new Error('boom')
        })
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('boom')
    })

    test('throws if function does not throw', async () => {
        await expect(expectToThrow(() => {})).rejects.toThrow('Expected function to throw, but it did not')
    })

    test('works with async functions', async () => {
        const error = await expectToThrow(async () => {
            throw new TypeError('async fail')
        })
        expect(error).toBeInstanceOf(TypeError)
    })
})

describe('createSequentialMock', () => {
    test('returns values in sequence', () => {
        const mock = createSequentialMock('a', 'b', 'c')
        expect(mock()).toBe('a')
        expect(mock()).toBe('b')
        expect(mock()).toBe('c')
    })

    test('throws when exhausted', () => {
        const mock = createSequentialMock('only')
        mock()
        expect(() => mock()).toThrow('Sequential mock exhausted')
    })
})
