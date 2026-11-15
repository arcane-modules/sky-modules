import { describe, expect, test } from 'vitest'
import { repeat } from './repeat'

describe('repeat', () => {
    test('executes callback specified times', async () => {
        const calls: number[] = []
        await repeat(5, (i) => {
            calls.push(i)
        })
        expect(calls).toEqual([0, 1, 2, 3, 4])
    })

    test('passes additional args', async () => {
        const calls: Array<[number, string, string]> = []
        await repeat(
            3,
            (i, prefix, suffix) => {
                calls.push([i, prefix, suffix])
                return undefined
            },
            'pre',
            'suf'
        )
        expect(calls[0]).toEqual([0, 'pre', 'suf'])
        expect(calls[1]).toEqual([1, 'pre', 'suf'])
        expect(calls[2]).toEqual([2, 'pre', 'suf'])
    })

    test('awaits async callbacks', async () => {
        let done = false
        await repeat(1, async () => {
            await new Promise((r) => setTimeout(r, 10))
            done = true
        })
        expect(done).toBe(true)
    })
})
