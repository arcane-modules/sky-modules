/**
 * Tests for SignalLamp — isolated reactive state component
 */

import { describe, expect, test } from 'vitest'
import { SignalLamp } from './SignalLamp'
import { signal } from './signal'

describe('SignalLamp', () => {
    test('creates a lamp with a target object', () => {
        const state = signal({ health: 100, name: 'hero' })
        const lamp = new SignalLamp(state)

        expect(lamp.target.health).toBe(100)
        expect(lamp.target.name).toBe('hero')
    })

    test('onSync fires when target property changes', async () => {
        const state = signal({ health: 100 })
        const lamp = new SignalLamp(state)
        const deltas: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => {
            deltas.push(delta)
        })

        state.health = 50
        await lamp.committed()

        expect(deltas).toHaveLength(1)
        expect(deltas[0]).toEqual({ health: 50 })
    })

    test('batches multiple changes in one tick', async () => {
        const state = signal({ x: 0, y: 0 })
        const lamp = new SignalLamp(state)
        const deltas: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => {
            deltas.push(delta)
        })

        state.x = 10
        state.y = 20
        await lamp.committed()

        expect(deltas).toHaveLength(1)
        expect(deltas[0]).toEqual({ x: 10, y: 20 })
    })

    test('fires multiple sync callbacks', async () => {
        const state = signal({ health: 100 })
        const lamp = new SignalLamp(state)
        const results1: Array<Record<string, unknown>> = []
        const results2: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => results1.push(delta))
        lamp.onSync((delta) => results2.push(delta))

        state.health = 50
        await lamp.committed()

        expect(results1).toHaveLength(1)
        expect(results2).toHaveLength(1)
        expect(results1[0]).toEqual({ health: 50 })
        expect(results2[0]).toEqual({ health: 50 })
    })

    test('unsubscribe removes callback', async () => {
        const state = signal({ health: 100 })
        const lamp = new SignalLamp(state)
        const results: Array<Record<string, unknown>> = []

        const unsub = lamp.onSync((delta) => results.push(delta))
        unsub()

        state.health = 50
        await lamp.committed()

        expect(results).toHaveLength(0)
    })

    test('getSnapshot returns current values', () => {
        const state = signal({ health: 100, name: 'hero' })
        const lamp = new SignalLamp(state)

        state.health = 50
        const snapshot = lamp.getSnapshot()
        expect(snapshot).toEqual({ health: 50, name: 'hero' })
    })

    test('committed() waits for pending sync', async () => {
        const state = signal({ health: 100 })
        const lamp = new SignalLamp(state)
        let synced = false

        lamp.onSync(() => {
            synced = true
        })

        state.health = 50
        expect(synced).toBe(false)

        await lamp.committed()
        expect(synced).toBe(true)
    })

    test('handles multiple state changes over time', async () => {
        const state = signal({ health: 100 })
        const lamp = new SignalLamp(state)
        const deltas: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => deltas.push(delta))

        state.health = 50
        await lamp.committed()
        expect(deltas).toHaveLength(1)
        expect(deltas[0]).toEqual({ health: 50 })

        state.health = 75
        await lamp.committed()
        expect(deltas).toHaveLength(2)
        expect(deltas[1]).toEqual({ health: 75 })
    })

    test('nested objects are serialized as values in delta', async () => {
        const state = signal({
            player: { health: 100, name: 'hero' },
        })
        const lamp = new SignalLamp(state)
        const deltas: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => deltas.push(delta))

        ;(state.player as Record<string, unknown>).health = 50
        await lamp.committed()

        expect(deltas).toHaveLength(1)
        expect(deltas[0]!.player).toEqual({ health: 50, name: 'hero' })
    })

    test('works with plain objects (no reactive decorators)', async () => {
        // Plain objects don't trigger change listener on set,
        // so onSync should never fire
        const obj: Record<string, unknown> = { x: 0 }
        const lamp = new SignalLamp(obj)
        const deltas: Array<Record<string, unknown>> = []

        lamp.onSync((delta) => deltas.push(delta))

        obj.x = 10
        await lamp.committed()

        // No change listener on plain objects — no delta
        expect(deltas).toHaveLength(0)
    })
})
