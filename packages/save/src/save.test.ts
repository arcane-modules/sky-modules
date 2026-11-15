/**
 * Tests for @sky-modules/save — persistence (save/load).
 */

import { describe, expect, test } from 'vitest'
import { define } from '@sky-modules/define'
import { number, string, secret, date, registerReactiveHook } from '@sky-modules/reactive'
import { save, load, serializeWithMetadata, deserializeWithMetadata } from './index'

registerReactiveHook()

// ─── Test classes ─────────────────────────────────────────────────

@define('test.User')
class User {
    @string name = ''
    @number age = 0
}

@define('test.Player')
class Player {
    @number x = 0
    @number y = 0
    @string name = 'hero'
}

@define('test.WithSecret')
class WithSecret {
    @string publicField = 'visible'
    @secret.string secretField = 'hidden'
}

// ─── Tests ────────────────────────────────────────────────────────

describe('save', () => {
    // ─── serializeWithMetadata ────────────────────────────────────

    describe('serializeWithMetadata', () => {
        test('handles null and undefined', () => {
            expect(serializeWithMetadata(null)).toBeNull()
            expect(serializeWithMetadata(undefined)).toBeUndefined()
        })

        test('handles primitive values', () => {
            expect(serializeWithMetadata(42)).toBe(42)
            expect(serializeWithMetadata('hello')).toBe('hello')
            expect(serializeWithMetadata(true)).toBe(true)
            expect(serializeWithMetadata(false)).toBe(false)
        })

        test('handles arrays', () => {
            const result = serializeWithMetadata([1, 'two', true]) as unknown[]
            expect(result).toEqual([1, 'two', true])
        })

        test('handles Date', () => {
            const date = new Date('2024-01-01T00:00:00.000Z')
            const result = serializeWithMetadata(date) as Record<string, unknown>
            expect(result.__type).toBe('Date')
            expect(result.value).toBe('2024-01-01T00:00:00.000Z')
        })

        test('handles Map', () => {
            const map = new Map([['key', 'value']])
            const result = serializeWithMetadata(map) as Record<string, unknown>
            expect(result.__type).toBe('Map')
            expect(result.entries).toEqual([['key', 'value']])
        })

        test('handles Set', () => {
            const set = new Set([1, 2, 3])
            const result = serializeWithMetadata(set) as Record<string, unknown>
            expect(result.__type).toBe('Set')
            expect(result.values).toEqual([1, 2, 3])
        })

        test('handles RegExp', () => {
            const regex = /test/gi
            const result = serializeWithMetadata(regex) as Record<string, unknown>
            expect(result.__type).toBe('RegExp')
            expect(result.source).toBe('test')
            expect(result.flags).toBe('gi')
        })

        test('serializes @define object with class metadata', () => {
            const user = new User()
            user.name = 'Anna'
            user.age = 25

            const result = serializeWithMetadata(user) as Record<string, unknown>
            expect(result.class).toBe('test.User')
            expect(typeof result.id).toBe('number')
            expect(result.version).toBeNull()
            expect(result.data).toEqual({ name: 'Anna', age: 25 })
        })

        test('serializes ALL fields including @secret', () => {
            const obj = new WithSecret()
            obj.publicField = 'visible'
            obj.secretField = 'hidden'

            const result = serializeWithMetadata(obj) as Record<string, unknown>
            const data = result.data as Record<string, unknown>
            expect(data.publicField).toBe('visible')
            expect(data.secretField).toBe('hidden')
        })

        test('handles nested @define objects', () => {
            @define('test.Nested')
            class Nested {
                @string label = ''
            }

            @define('test.Container')
            class Container {
                nested: Nested = new Nested()
            }

            const container = new Container()
            container.nested.label = 'test'

            const result = serializeWithMetadata(container) as Record<string, unknown>
            const data = result.data as Record<string, unknown>
            expect(data.nested).toEqual({
                class: 'test.Nested',
                id: expect.any(Number),
                version: null,
                data: { label: 'test' },
            })
        })

        test('handles plain objects', () => {
            const result = serializeWithMetadata({ x: 10, y: 20 }) as Record<string, unknown>
            expect(result).toEqual({ x: 10, y: 20 })
        })
    })

    // ─── deserializeWithMetadata ──────────────────────────────────

    describe('deserializeWithMetadata', () => {
        test('handles null and undefined', () => {
            expect(deserializeWithMetadata(null)).toBeNull()
            expect(deserializeWithMetadata(undefined)).toBeUndefined()
        })

        test('handles primitive values', () => {
            expect(deserializeWithMetadata(42)).toBe(42)
            expect(deserializeWithMetadata('hello')).toBe('hello')
            expect(deserializeWithMetadata(true)).toBe(true)
        })

        test('handles arrays', () => {
            const result = deserializeWithMetadata([1, 'two', true]) as unknown[]
            expect(result).toEqual([1, 'two', true])
        })

        test('restores Date', () => {
            const result = deserializeWithMetadata({
                __type: 'Date',
                value: '2024-01-01T00:00:00.000Z',
            })
            expect(result).toBeInstanceOf(Date)
            expect((result as Date).toISOString()).toBe('2024-01-01T00:00:00.000Z')
        })

        test('restores Map', () => {
            const result = deserializeWithMetadata({
                __type: 'Map',
                entries: [['key', 'value']],
            })
            expect(result).toBeInstanceOf(Map)
            expect((result as Map<string, string>).get('key')).toBe('value')
        })

        test('restores Set', () => {
            const result = deserializeWithMetadata({
                __type: 'Set',
                values: [1, 2, 3],
            })
            expect(result).toBeInstanceOf(Set)
            expect((result as Set<number>).has(1)).toBe(true)
            expect((result as Set<number>).has(4)).toBe(false)
        })

        test('restores RegExp', () => {
            const result = deserializeWithMetadata({
                __type: 'RegExp',
                source: 'test',
                flags: 'gi',
            })
            expect(result).toBeInstanceOf(RegExp)
            expect((result as RegExp).source).toBe('test')
            expect((result as RegExp).flags).toBe('gi')
        })

        test('restores @define object with class instance', () => {
            const result = deserializeWithMetadata({
                class: 'test.User',
                id: 1,
                version: null,
                data: { name: 'Anna', age: 25 },
            })

            expect(result).toBeInstanceOf(User)
            expect((result as User).name).toBe('Anna')
            expect((result as User).age).toBe(25)
        })

        test('throws on unknown class', () => {
            expect(() =>
                deserializeWithMetadata({
                    class: 'test.Unknown',
                    id: 1,
                    version: null,
                    data: {},
                })
            ).toThrow('Unknown class')
        })

        test('restores nested @define objects', () => {
            @define('test.Nested2')
            class Nested2 {
                @string label = ''
            }

            @define('test.Container2')
            class Container2 {
                nested: Nested2 = new Nested2()
            }

            const result = deserializeWithMetadata({
                class: 'test.Container2',
                id: 1,
                version: null,
                data: {
                    nested: {
                        class: 'test.Nested2',
                        id: 2,
                        version: null,
                        data: { label: 'test' },
                    },
                },
            })

            expect(result).toBeInstanceOf(Container2)
            const container = result as Container2 & { nested: Nested2 }
            expect(container.nested).toBeInstanceOf(Nested2)
            expect(container.nested.label).toBe('test')
        })
    })

    // ─── save / load round-trip ───────────────────────────────────

    describe('save/load round-trip', () => {
        test('save and load a simple object', () => {
            const player = new Player()
            player.x = 10
            player.y = 20
            player.name = 'Alice'

            const json = save(player)
            const restored = load<Player>(json)

            expect(restored).toBeInstanceOf(Player)
            expect(restored.x).toBe(10)
            expect(restored.y).toBe(20)
            expect(restored.name).toBe('Alice')
        })

        test('save and load with special types', () => {
            @define('test.WithSpecial')
            class WithSpecial {
                @date created = new Date()
                tags = new Map<string, string>()
                scores = new Set<number>()
            }

            const obj = new WithSpecial()
            obj.created = new Date('2024-01-01')
            obj.tags.set('role', 'admin')
            obj.scores.add(100)

            const json = save(obj)
            const restored = load<WithSpecial>(json)

            expect(restored).toBeInstanceOf(WithSpecial)
            expect(restored.created).toBeInstanceOf(Date)
            expect(restored.created.toISOString()).toBe('2024-01-01T00:00:00.000Z')
            expect(restored.tags).toBeInstanceOf(Map)
            expect(restored.tags.get('role')).toBe('admin')
            expect(restored.scores).toBeInstanceOf(Set)
            expect(restored.scores.has(100)).toBe(true)
        })

        test('save and load preserves @secret fields', () => {
            const obj = new WithSecret()
            obj.publicField = 'visible'
            obj.secretField = 'hidden'

            const json = save(obj)
            const restored = load<WithSecret>(json)

            expect(restored.publicField).toBe('visible')
            expect(restored.secretField).toBe('hidden')
        })

        test('load throws on invalid JSON', () => {
            expect(() => load('not json')).toThrow()
        })
    })
})
