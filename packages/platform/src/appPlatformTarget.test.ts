import { describe, expect, test } from 'vitest'
import { appPlatformTarget } from './appPlatformTarget'

describe('appPlatformTarget', () => {
    test('detects as node in vitest environment', () => {
        expect(appPlatformTarget).toBe('node')
    })
})
