import { describe, expect, test } from 'vitest'
import {
    platform,
    isNode,
    isCirrus,
    isBrowser,
    isWebWorker,
    isDeno,
    isBun,
    isElectron,
    isTauri,
    isCapacitor,
} from './platformDetect'

describe('platform detection', () => {
    test('detects Node.js in vitest environment', () => {
        expect(isNode).toBe(true)
        expect(platform).toBe('node')
    })

    test('all other platforms are false in Node.js', () => {
        expect(isCirrus).toBe(false)
        expect(isBrowser).toBe(false)
        expect(isWebWorker).toBe(false)
        expect(isDeno).toBe(false)
        expect(isBun).toBe(false)
        expect(isElectron).toBe(false)
        expect(isTauri).toBe(false)
        expect(isCapacitor).toBe(false)
    })
})
