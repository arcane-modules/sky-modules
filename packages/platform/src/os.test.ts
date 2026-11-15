import { describe, expect, test } from 'vitest'
import { os, isMac, isWindows, isLinux, isAndroid, isIOS } from './os'

describe('OS detection', () => {
    test('detects OS (running in Node.js)', () => {
        // On macOS GitHub Actions or dev machines
        expect(['mac', 'windows', 'linux']).toContain(os)
    })

    test('at least one OS boolean is true', () => {
        expect(isMac || isWindows || isLinux).toBe(true)
    })

    test('mobile OS flags are false in Node.js', () => {
        expect(isAndroid).toBe(false)
        expect(isIOS).toBe(false)
    })
})
