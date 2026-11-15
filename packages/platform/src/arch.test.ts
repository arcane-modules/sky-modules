import { describe, expect, test } from 'vitest'
import { arch, isX64, isArm64 } from './arch'

describe('arch detection', () => {
    test('detects architecture (running in Node.js)', () => {
        expect(['x64', 'arm64', 'ia32']).toContain(arch)
    })

    test('isX64 or isArm64 is true (at least one)', () => {
        expect(isX64 || isArm64).toBe(true)
    })
})
