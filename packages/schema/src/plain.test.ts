/**
 * Tests for plain object utilities
 */

import { describe, expect, test } from 'vitest'
import { number, string } from './types'
import { makePlain, createPlain, hasSchema, getSchemaKeys } from './plain'

describe('plain utilities', () => {
    describe('makePlain', () => {
        test('creates a plain object from a class constructor', () => {
            class Player {
                @number x: number = 0
                @number y: number = 0
                @string name: string = ''
            }

            const plain = makePlain(Player)
            expect(plain).toEqual({ x: 0, y: 0, name: '' })
        })

        test('applies initial values', () => {
            class Player {
                @number x: number = 0
                @number y: number = 0
                @string name: string = ''
            }

            const plain = makePlain(Player, { x: 10, y: 20 })
            expect(plain).toEqual({ x: 10, y: 20, name: '' })
        })

        test('returns instance if no schema', () => {
            class PlainClass {
                x: number = 0
                y: number = 0
            }

            const plain = makePlain(PlainClass)
            expect(plain.x).toBe(0)
            expect(plain.y).toBe(0)
        })
    })

    describe('createPlain', () => {
        test('creates a plain object from a schema definition', () => {
            const PlayerSchema = {
                x: number,
                y: number,
                name: string,
            }

            const plain = createPlain(PlayerSchema)
            expect(plain).toEqual({ x: undefined, y: undefined, name: undefined })
        })
    })

    describe('hasSchema', () => {
        test('returns true for class with schema decorators', () => {
            class Player {
                @number x: number = 0
            }

            expect(hasSchema(Player.prototype)).toBe(true)
        })

        test('returns false for plain class', () => {
            class PlainClass {
                x: number = 0
            }

            expect(hasSchema(PlainClass.prototype)).toBe(false)
        })
    })

    describe('getSchemaKeys', () => {
        test('returns schema keys from class prototype', () => {
            class Player {
                @number x: number = 0
                @number y: number = 0
                @string name: string = ''
            }

            const keys = getSchemaKeys(Player.prototype)
            expect(keys).toContain('x')
            expect(keys).toContain('y')
            expect(keys).toContain('name')
        })

        test('returns empty array for class without schema', () => {
            class PlainClass {
                x: number = 0
            }

            expect(getSchemaKeys(PlainClass.prototype)).toEqual([])
        })
    })
})
