/**
 * Tests for @sky-modules/share — network sync for reactive lamps.
 */

import { describe, expect, test, beforeEach } from 'vitest'
import { define } from '@sky-modules/define'
import { number, string, boolean, registerReactiveHook } from '@sky-modules/reactive'
import { share, unshare, destroy, isShared, sharedCount, clearShareStates } from './share'
import { apply, registerObject, unregisterObject, getObjectById, clearRegistry, resetIdCounter } from './apply'
import { serializeObject, deserializeObject, getClassUid } from './serialize'
import type { Delta } from './types'

// Register reactive hook so decorators create reactive properties
registerReactiveHook()

beforeEach(() => {
    clearShareStates()
    clearRegistry()
    resetIdCounter()
})

// ─── Test classes ─────────────────────────────────────────────────

@define('test.Player')
class Player {
    @number x = 0
    @number y = 0
    @string name = 'hero'
}

@define('test.Enemy')
class Enemy {
    @number health = 100
    @number damage = 10
    @boolean alive = true
}

// ─── Serialize ────────────────────────────────────────────────────

describe('serialize', () => {
    test('serializeObject returns plain data', () => {
        const player = new Player()
        player.x = 10
        player.y = 20

        const data = serializeObject(player) as Record<string, unknown>
        expect(data).toEqual({ x: 10, y: 20, name: 'hero' })
    })

    test('serializeObject handles null and undefined', () => {
        expect(serializeObject(null)).toBeNull()
        expect(serializeObject(undefined)).toBeUndefined()
    })

    test('serializeObject handles primitive values', () => {
        expect(serializeObject(42)).toBe(42)
        expect(serializeObject('hello')).toBe('hello')
        expect(serializeObject(true)).toBe(true)
    })

    test('serializeObject handles arrays', () => {
        const data = serializeObject([1, 2, 3])
        expect(data).toEqual([1, 2, 3])
    })

    test('serializeObject handles Date', () => {
        const date = new Date('2024-01-01')
        const data = serializeObject(date) as Record<string, unknown>
        expect(data.__type).toBe('Date')
        expect(data.value).toBe('2024-01-01T00:00:00.000Z')
    })

    test('serializeObject handles Map', () => {
        const map = new Map([
            ['a', 1],
            ['b', 2],
        ])
        const data = serializeObject(map) as Record<string, unknown>
        expect(data.__type).toBe('Map')
    })

    test('serializeObject handles Set', () => {
        const set = new Set([1, 2, 3])
        const data = serializeObject(set) as Record<string, unknown>
        expect(data.__type).toBe('Set')
    })

    test('deserializeObject restores Date', () => {
        const data = { __type: 'Date', value: '2024-01-01T00:00:00.000Z' }
        const result = deserializeObject(data)
        expect(result).toBeInstanceOf(Date)
        expect((result as Date).toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('deserializeObject restores Map', () => {
        const data = {
            __type: 'Map',
            entries: [
                ['a', 1],
                ['b', 2],
            ],
        }
        const result = deserializeObject(data)
        expect(result).toBeInstanceOf(Map)
        expect((result as Map<string, number>).get('a')).toBe(1)
    })

    test('deserializeObject restores Set', () => {
        const data = { __type: 'Set', values: [1, 2, 3] }
        const result = deserializeObject(data)
        expect(result).toBeInstanceOf(Set)
        expect((result as Set<number>).has(1)).toBe(true)
    })

    test('getClassUid returns class UID', () => {
        const player = new Player()
        const uid = getClassUid(player)
        expect(uid).toBe('test.Player')
    })
})

// ─── Apply ────────────────────────────────────────────────────────

describe('apply', () => {
    test('CREATE instantiates a class and registers it', () => {
        const delta: Delta = {
            type: 'CREATE',
            id: 1,
            class: 'test.Player',
            data: { x: 10, y: 20, name: 'hero' },
        }

        const instance = apply(delta)
        expect(instance).toBeDefined()
        expect(instance).toBeInstanceOf(Player)
        expect((instance as Player).x).toBe(10)
        expect((instance as Player).y).toBe(20)
        expect((instance as Player).name).toBe('hero')

        // Check registry
        const found = getObjectById(1)
        expect(found).toBe(instance)
    })

    test('CREATE throws on unknown class', () => {
        const delta: Delta = {
            type: 'CREATE',
            id: 1,
            class: 'unknown.Class',
            data: {},
        }

        expect(() => apply(delta)).toThrow('Unknown class')
    })

    test('SET updates properties on existing object', () => {
        // First create
        const createDelta: Delta = {
            type: 'CREATE',
            id: 1,
            class: 'test.Player',
            data: { x: 0, y: 0, name: 'hero' },
        }
        apply(createDelta)

        // Then set
        const setDelta: Delta = {
            type: 'SET',
            id: 1,
            data: { x: 50, y: 100 },
        }
        const instance = apply(setDelta)
        expect(instance).toBeDefined()
        expect((instance as Player).x).toBe(50)
        expect((instance as Player).y).toBe(100)
        expect((instance as Player).name).toBe('hero') // unchanged
    })

    test('SET returns undefined for unknown ID', () => {
        const delta: Delta = {
            type: 'SET',
            id: 999,
            data: { x: 50 },
        }
        expect(apply(delta)).toBeUndefined()
    })

    test('DESTROY removes object from registry', () => {
        // First create
        const createDelta: Delta = {
            type: 'CREATE',
            id: 1,
            class: 'test.Player',
            data: {},
        }
        apply(createDelta)
        expect(getObjectById(1)).toBeDefined()

        // Then destroy
        const destroyDelta: Delta = {
            type: 'DESTROY',
            id: 1,
        }
        apply(destroyDelta)
        expect(getObjectById(1)).toBeUndefined()
    })

    test('registerObject assigns ID and stores object', () => {
        const player = new Player()
        const id = registerObject(player)
        expect(id).toBeGreaterThan(0)
        expect(getObjectById(id)).toBe(player)
    })

    test('unregisterObject removes from registry', () => {
        const player = new Player()
        const id = registerObject(player)
        expect(getObjectById(id)).toBeDefined()

        unregisterObject(player)
        expect(getObjectById(id)).toBeUndefined()
    })
})

// ─── Share ─────────────────────────────────────────────────────────

describe('share', () => {
    test('share sends CREATE delta with full state', () => {
        const player = new Player()
        player.x = 10
        player.y = 20

        const deltas: Delta[] = []
        share(player, (delta) => deltas.push(delta))

        expect(deltas).toHaveLength(1)
        expect(deltas[0]!.type).toBe('CREATE')
        expect((deltas[0]! as Extract<Delta, { type: 'CREATE' }>).id).toBeGreaterThan(0)
        expect((deltas[0]! as Extract<Delta, { type: 'CREATE' }>).class).toBe('test.Player')
        expect((deltas[0]! as Extract<Delta, { type: 'CREATE' }>).data).toEqual({
            x: 10,
            y: 20,
            name: 'hero',
        })
    })

    test('share sends SET delta on property change', async () => {
        const player = new Player()
        const deltas: Delta[] = []
        share(player, (delta) => deltas.push(delta))

        // Clear CREATE delta
        deltas.length = 0

        // Change a property
        player.x = 50

        // Wait for microtask
        await new Promise((resolve) => setTimeout(resolve, 10))

        expect(deltas).toHaveLength(1)
        expect(deltas[0]!.type).toBe('SET')
        const setDelta = deltas[0]! as Extract<Delta, { type: 'SET' }>
        expect(setDelta.data).toEqual({ x: 50 })
    })

    test('share batches multiple changes in one SET delta', async () => {
        const player = new Player()
        const deltas: Delta[] = []
        share(player, (delta) => deltas.push(delta))

        // Clear CREATE delta
        deltas.length = 0

        // Change multiple properties in same tick
        player.x = 10
        player.y = 20
        player.name = 'warrior'

        // Wait for microtask
        await new Promise((resolve) => setTimeout(resolve, 10))

        expect(deltas).toHaveLength(1)
        const setDelta = deltas[0]! as Extract<Delta, { type: 'SET' }>
        expect(setDelta.data).toEqual({ x: 10, y: 20, name: 'warrior' })
    })

    test('share does not duplicate for same object', () => {
        const player = new Player()
        const deltas1: Delta[] = []
        const deltas2: Delta[] = []

        share(player, (delta) => deltas1.push(delta))
        share(player, (delta) => deltas2.push(delta))

        // Only one CREATE delta sent (first share)
        expect(deltas1).toHaveLength(1)
        expect(deltas2).toHaveLength(0)
    })

    test('isShared returns true for shared objects', () => {
        const player = new Player()
        expect(isShared(player)).toBe(false)

        share(player, () => {})
        expect(isShared(player)).toBe(true)
    })

    test('unshare stops sending deltas', async () => {
        const player = new Player()
        const deltas: Delta[] = []
        share(player, (delta) => deltas.push(delta))

        // Clear CREATE delta
        deltas.length = 0

        unshare(player)
        expect(isShared(player)).toBe(false)

        // Change property — should NOT send delta
        player.x = 50
        await new Promise((resolve) => setTimeout(resolve, 10))

        expect(deltas).toHaveLength(0)
    })

    test('destroy sends DESTROY delta and unshares', () => {
        const player = new Player()
        const deltas: Delta[] = []
        share(player, (delta) => deltas.push(delta))

        // Clear CREATE delta
        deltas.length = 0

        destroy(player)

        expect(deltas).toHaveLength(1)
        expect(deltas[0]!.type).toBe('DESTROY')
        expect((deltas[0]! as Extract<Delta, { type: 'DESTROY' }>).id).toBeGreaterThan(0)
        expect(isShared(player)).toBe(false)
    })

    test('sharedCount returns correct count', () => {
        expect(sharedCount()).toBe(0)

        const player = new Player()
        const enemy = new Enemy()

        share(player, () => {})
        expect(sharedCount()).toBe(1)

        share(enemy, () => {})
        expect(sharedCount()).toBe(2)

        unshare(player)
        expect(sharedCount()).toBe(1)

        unshare(enemy)
        expect(sharedCount()).toBe(0)
    })

    test('full round-trip: share → apply', async () => {
        // Server creates and shares
        const serverPlayer = new Player()
        serverPlayer.x = 10
        serverPlayer.y = 20

        const deltas: Delta[] = []
        share(serverPlayer, (delta) => deltas.push(delta))

        // Client applies CREATE
        const createDelta = deltas[0]!
        const clientPlayer = apply(createDelta)
        expect(clientPlayer).toBeInstanceOf(Player)
        expect((clientPlayer as Player).x).toBe(10)
        expect((clientPlayer as Player).y).toBe(20)

        // Server changes property
        deltas.length = 0
        serverPlayer.x = 50
        await new Promise((resolve) => setTimeout(resolve, 10))

        // Client applies SET
        const setDelta = deltas[0]!
        apply(setDelta)
        expect((clientPlayer as Player).x).toBe(50)
    })
})
