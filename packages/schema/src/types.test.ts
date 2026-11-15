/**
 * Tests for schema type decorators
 */

import { describe, expect, test } from 'vitest'
import {
    boolean,
    number,
    string,
    bigint,
    symbol,
    date,
    object,
    array,
    map,
    set,
    optional,
    nullable,
    nullish,
    read,
    write,
    secret,
    unwrapType,
    Modifier,
} from './types'
import { schemaSymbol, propertyIndexSymbol } from '@sky-modules/define'

describe('schema decorators', () => {
    describe('primitives', () => {
        test('@boolean creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'isActive'

            boolean(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
            expect(desc!.enumerable).toBe(true)
            expect(desc!.configurable).toBe(true)
            expect(typeof desc!.get).toBe('function')
            expect(typeof desc!.set).toBe('function')
        })

        test('@number creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'health'

            number(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
            expect(desc!.enumerable).toBe(true)
        })

        test('@string creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'name'

            string(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
            expect(desc!.enumerable).toBe(true)
        })

        test('@bigint creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'id'

            bigint(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })

        test('@symbol creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'key'

            symbol(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })

        test('@date creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'createdAt'

            date(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })
    })

    describe('get/set behavior', () => {
        test('default get/set stores and retrieves values', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'health'

            number(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)!
            desc.set!.call(target, 42)
            const result = desc.get!.call(target)

            expect(result).toBe(42)
        })

        test('multiple properties work independently', () => {
            const target: Record<PropertyKey, unknown> = {}

            number(target, 'x')
            string(target, 'name')

            const xDesc = Object.getOwnPropertyDescriptor(target, 'x')!
            const nameDesc = Object.getOwnPropertyDescriptor(target, 'name')!

            xDesc.set!.call(target, 10)
            nameDesc.set!.call(target, 'hero')

            expect(xDesc.get!.call(target)).toBe(10)
            expect(nameDesc.get!.call(target)).toBe('hero')
        })
    })

    describe('schema metadata', () => {
        test('stores schema on prototype', () => {
            const target: Record<PropertyKey, unknown> = {}

            number(target, 'x')
            string(target, 'name')

            const proto = target as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>

            expect(schema).toBeDefined()
            expect(schema.x).toBe(number)
            expect(schema.name).toBe(string)
        })

        test('increments property index', () => {
            const target: Record<PropertyKey, unknown> = {}

            number(target, 'x')
            string(target, 'name')

            const proto = target as Record<symbol, unknown>
            expect(proto[propertyIndexSymbol]).toBe(2)
        })
    })

    describe('array', () => {
        test('@array creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'scores'

            array(number)(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
            expect(desc!.enumerable).toBe(true)
        })

        test('@array stores element type in schema', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'tags'

            array(string)(target, key)

            const proto = target as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>

            expect(schema.tags).toBe(string)
        })
    })

    describe('object', () => {
        test('@object creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'address'

            class Address {}
            object(Address)(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })
    })

    describe('map and set', () => {
        test('@map creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'scores'

            map(string, number)(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })

        test('@set creates a property descriptor', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'tags'

            set(string)(target, key)

            const desc = Object.getOwnPropertyDescriptor(target, key)
            expect(desc).toBeDefined()
        })
    })

    describe('modifiers', () => {
        test('read() wraps schema with READ modifier', () => {
            const result = read(number)
            const { type, modifier } = unwrapType(result)
            expect(modifier).toBe(Modifier.READ)
            expect(type).toBe(number)
        })

        test('write() wraps schema with WRITE modifier', () => {
            const result = write(string)
            const { type, modifier } = unwrapType(result)
            expect(modifier).toBe(Modifier.WRITE)
            expect(type).toBe(string)
        })

        test('secret() wraps schema with SECRET modifier', () => {
            const result = secret(boolean)
            const { type, modifier } = unwrapType(result)
            expect(modifier).toBe(Modifier.SECRET)
            expect(type).toBe(boolean)
        })

        test('read.number creates a modified decorator', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'health'

            read.number(target, key)

            const proto = target as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>
            const { modifier } = unwrapType(schema[key])

            expect(modifier).toBe(Modifier.READ)
        })

        test('write.number creates a modified decorator', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'input'

            write.number(target, key)

            const proto = target as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>
            const { modifier } = unwrapType(schema[key])

            expect(modifier).toBe(Modifier.WRITE)
        })

        test('secret.string creates a modified decorator', () => {
            const target: Record<PropertyKey, unknown> = {}
            const key = 'password'

            secret.string(target, key)

            const proto = target as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>
            const { modifier } = unwrapType(schema[key])

            expect(modifier).toBe(Modifier.SECRET)
        })
    })

    describe('optional / nullable / nullish', () => {
        test('optional() marks schema as optional', () => {
            const result = optional(string)
            expect(result).toBe(string)
        })

        test('nullable() marks schema as nullable', () => {
            const result = nullable(number)
            expect(result).toBe(number)
        })

        test('nullish() marks schema as nullish', () => {
            const result = nullish(boolean)
            expect(result).toBe(boolean)
        })

        test('optional.number is a shortcut', () => {
            const result = optional.number
            expect(result).toBe(optional(number))
        })
    })

    describe('unwrapType', () => {
        test('returns READ modifier for plain schemas', () => {
            const { type, modifier } = unwrapType(number)
            expect(modifier).toBe(Modifier.READ)
            expect(type).toBe(number)
        })

        test('returns READ modifier for non-object values', () => {
            const { type, modifier } = unwrapType(42)
            expect(modifier).toBe(Modifier.READ)
            expect(type).toBe(42)
        })
    })

    describe('class integration', () => {
        test('decorators work on class properties', () => {
            class Player {
                @number x: number = 0
                @number y: number = 0
                @string name: string = ''
            }

            const p = new Player()
            expect(p.x).toBe(0)
            expect(p.y).toBe(0)
            expect(p.name).toBe('')

            p.x = 10
            p.name = 'hero'
            expect(p.x).toBe(10)
            expect(p.name).toBe('hero')
        })

        test('schema metadata on class prototype', () => {
            class Player {
                @number x: number = 0
                @string name: string = ''
            }

            const proto = Player.prototype as unknown as Record<symbol, unknown>
            const schema = proto[schemaSymbol] as Record<PropertyKey, unknown>

            expect(schema).toBeDefined()
            expect(schema.x).toBe(number)
            expect(schema.name).toBe(string)
        })
    })
})
