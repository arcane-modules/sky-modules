import { describe, expect, test } from 'vitest'
import { runsOnSide, runsOnServerSide, runsOnClientSide } from './runsOnSide'

describe('runsOnSide', () => {
    test('detects server side (running in Node.js)', () => {
        expect(runsOnSide).toBe('server')
        expect(runsOnServerSide).toBe(true)
        expect(runsOnClientSide).toBe(false)
    })
})
