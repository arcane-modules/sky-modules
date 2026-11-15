/**
 * Tests for signal() — reactive value wrapper
 */

import { describe, expect, test } from 'vitest'
import { signal, getRawValue, isSignal } from './signal'
import { CHANGE_LISTENER } from '../internal/symbols'

describe('signal()', () => {
    test('creates a reactive proxy from initial object', () => {
        const state = signal({ health: 100, name: 'hero' })
        expect(state.health).toBe(100)
        expect(state.name).toBe('hero')
    })

    test('updates value when property is set', () => {
        const state = signal({ health: 100 })
        state.health = 50
        expect(state.health).toBe(50)
    })

    test('triggers change listener on property set', () => {
        const state = signal({ health: 100 })
        const changes: Array<{ key: string; value: unknown }> = []

        // Register change listener via internal symbol
        ;(state as Record<symbol, unknown>)[CHANGE_LISTENER] = (key: string, _value: unknown, rawValue: unknown) => {
            changes.push({ key, value: rawValue })
        }

        state.health = 50
        expect(changes).toHaveLength(1)
        expect(changes[0]!.key).toBe('health')
        expect(changes[0]!.value).toBe(50)
    })

    test('handles multiple properties', () => {
        const state = signal({ x: 0, y: 0, z: 0 })
        const changes: string[] = []

        ;(state as Record<symbol, unknown>)[CHANGE_LISTENER] = (key: string) => {
            changes.push(key)
        }

        state.x = 10
        state.y = 20
        state.z = 30

        expect(state.x).toBe(10)
        expect(state.y).toBe(20)
        expect(state.z).toBe(30)
        expect(changes).toEqual(['x', 'y', 'z'])
    })

    test('isSignal returns true for signal proxies', () => {
        const state = signal({ a: 1 })
        expect(isSignal(state)).toBe(true)
    })

    test('isSignal returns false for plain objects', () => {
        expect(isSignal({ a: 1 })).toBe(false)
        expect(isSignal(null)).toBe(false)
        expect(isSignal(42)).toBe(false)
        expect(isSignal('string')).toBe(false)
    })

    test('getRawValue extracts plain object', () => {
        const state = signal({ health: 100, name: 'hero' })
        state.health = 50
        const raw = getRawValue(state)
        expect(raw).toEqual({ health: 50, name: 'hero' })
    })

    test('nested objects become reactive proxies', () => {
        const state = signal({
            player: { health: 100, name: 'hero' },
        })

        expect(isSignal(state.player as Record<string, unknown>)).toBe(true)
        expect((state.player as Record<string, unknown>).health).toBe(100)

        ;(state.player as Record<string, unknown>).health = 50
        expect((state.player as Record<string, unknown>).health).toBe(50)
    })

    test('getRawValue recursively extracts nested objects', () => {
        const state = signal({
            player: { health: 100, name: 'hero' },
        })
        ;(state.player as Record<string, unknown>).health = 50

        const raw = getRawValue(state)
        expect(raw).toEqual({
            player: { health: 50, name: 'hero' },
        })
    })

    test('handles array values', () => {
        const state = signal({ scores: [1, 2, 3] })
        expect(state.scores).toEqual([1, 2, 3])
    })

    test('handles null and undefined values', () => {
        const state = signal({ a: null, b: undefined })
        expect(state.a).toBeNull()
        expect(state.b).toBeUndefined()
    })

    test('supports Object.keys()', () => {
        const state = signal({ a: 1, b: 2 })
        expect(Object.keys(state)).toEqual(['a', 'b'])
    })

    test('supports Object.entries()', () => {
        const state = signal({ a: 1, b: 2 })
        const entries = Object.entries(state)
        expect(entries).toContainEqual(['a', 1])
        expect(entries).toContainEqual(['b', 2])
    })

    test('supports property enumeration (for...in)', () => {
        const state = signal({ a: 1, b: 2 })
        const keys: string[] = []
        for (const key in state) {
            keys.push(key)
        }
        expect(keys).toContain('a')
        expect(keys).toContain('b')
    })

    test('supports hasOwnProperty', () => {
        const state = signal({ a: 1 })
        expect(Object.hasOwn(state, 'a')).toBe(true)
        expect(Object.hasOwn(state, 'b')).toBe(false)
    })
})
