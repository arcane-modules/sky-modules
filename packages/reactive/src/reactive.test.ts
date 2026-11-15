/**
 * Tests for @sky-modules/reactive — Phase 1 Core
 */

import { describe, expect, test, beforeEach } from 'vitest'

import define, { DuplicateDefineError, InvalidDefineNameError } from './define'
import { number, string, boolean, array, object } from './types'
import { makePlain, createPlain, isPlain, getPlainSchema } from './plain'
import { clearRegistry, getDefine, hasDefine } from './internal/state'
import { idSymbol } from './internal/symbols'

// ─── Test Classes ────────────────────────────────────────────────

@define('test.Weapon')
class Weapon {
    @number damage = 10
    @string name = 'sword'
}

@define('test.Player')
class Player {
    @number health = 100
    @string name = ''
    @boolean isActive = true
}

@define('test.Inventory')
class Inventory {
    @array(number) scores: number[] = []
    @object(Weapon) weapon: Weapon | null = null
}

@define('test.ComplexArray')
class ComplexArray {
    @array(Weapon) items: Weapon[] = []
}

// ─── Cleanup before each test ────────────────────────────────────

beforeEach(() => {
    clearRegistry()
})

// ─── define() ────────────────────────────────────────────────────

describe('define()', () => {
    test('registers a class with auto-generated ID', () => {
        @define('test.MyClass')
        // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
        class MyClass {
            @number x = 0
        }

        const entry = getDefine('test.MyClass')
        expect(entry).toBeDefined()
        expect(entry!.name).toBe('test.MyClass')
        expect(entry!.value[idSymbol]).toBeGreaterThan(0)
    })

    test('throws DuplicateDefineError for duplicate names', () => {
        @define('test.DupA')
        // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
        class DupA {
            @number x = 0
        }

        expect(() => {
            @define('test.DupA')
            // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
            class DupB {
                @number y = 0
            }
        }).toThrow(DuplicateDefineError)
    })

    test('throws InvalidDefineNameError for bad names', () => {
        expect(() => {
            @define('123bad')
            // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
            class Bad {
                @number x = 0
            }
        }).toThrow(InvalidDefineNameError)

        expect(() => {
            @define('')
            // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
            class Empty {
                @number x = 0
            }
        }).toThrow(InvalidDefineNameError)
    })

    test('hasDefine returns correct boolean', () => {
        @define('test.Check')
        // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
        class Check {
            @number x = 0
        }

        expect(hasDefine('test.Check')).toBe(true)
        expect(hasDefine('test.Nonexistent')).toBe(false)
    })
})

// ─── @number ────────────────────────────────────────────────────

describe('@number', () => {
    test('creates reactive property', () => {
        @define('test.NumberTest')
        class NumberTest {
            @number value = 42
        }

        const instance = new NumberTest()
        expect(instance.value).toBe(42)
    })

    test('updates value via setter', () => {
        @define('test.NumberUpd')
        class NumberUpd {
            @number value = 0
        }

        const instance = new NumberUpd()
        instance.value = 100
        expect(instance.value).toBe(100)
    })

    test('supports negative numbers and zero', () => {
        @define('test.NumberRng')
        class NumberRng {
            @number min = -10 as number
            @number zero = 0
            @number max = 10
        }

        const instance = new NumberRng()
        expect(instance.min).toBe(-10)
        expect(instance.zero).toBe(0)
        expect(instance.max).toBe(10)
    })
})

// ─── @string ────────────────────────────────────────────────────

describe('@string', () => {
    test('creates reactive property', () => {
        @define('test.StrTest')
        class StrTest {
            @string value = 'hello'
        }

        const instance = new StrTest()
        expect(instance.value).toBe('hello')
    })

    test('updates value via setter', () => {
        @define('test.StrUpd')
        class StrUpd {
            @string value = ''
        }

        const instance = new StrUpd()
        instance.value = 'world'
        expect(instance.value).toBe('world')
    })

    test('supports empty string', () => {
        @define('test.EmptyStr')
        class EmptyStr {
            @string value = ''
        }

        const instance = new EmptyStr()
        expect(instance.value).toBe('')
    })
})

// ─── @boolean ───────────────────────────────────────────────────

describe('@boolean', () => {
    test('creates reactive property', () => {
        @define('test.BoolTst')
        class BoolTst {
            @boolean active = true
        }

        const instance = new BoolTst()
        expect(instance.active).toBe(true)
    })

    test('updates value via setter', () => {
        @define('test.BoolUpd')
        class BoolUpd {
            @boolean flag = false
        }

        const instance = new BoolUpd()
        instance.flag = true
        expect(instance.flag).toBe(true)
        instance.flag = false
        expect(instance.flag).toBe(false)
    })
})

// ─── Multiple properties ─────────────────────────────────────────

describe('multiple reactive properties', () => {
    test('Player class works with all types', () => {
        const player = new Player()
        expect(player.health).toBe(100)
        expect(player.name).toBe('')
        expect(player.isActive).toBe(true)

        player.health = 50
        player.name = 'Hero'
        player.isActive = false

        expect(player.health).toBe(50)
        expect(player.name).toBe('Hero')
        expect(player.isActive).toBe(false)
    })

    test('properties are independent', () => {
        @define('test.Indep')
        class Indep {
            @number a = 1
            @number b = 2
            @number c = 3
        }

        const obj = new Indep()
        obj.a = 10
        obj.c = 30

        expect(obj.a).toBe(10)
        expect(obj.b).toBe(2)
        expect(obj.c).toBe(30)
    })
})

// ─── @array ──────────────────────────────────────────────────────

describe('@array()', () => {
    test('creates array property', () => {
        @define('test.ArrBas')
        class ArrBas {
            @array(number) items: number[] = []
        }

        const obj = new ArrBas()
        expect(obj.items).toEqual([])
    })

    test('allows setting array value', () => {
        @define('test.ArrSet')
        class ArrSet {
            @array(number) items: number[] = []
        }

        const obj = new ArrSet()
        obj.items = [1, 2, 3]
        expect(obj.items).toEqual([1, 2, 3])
    })

    test('allows array mutations (push, pop)', () => {
        @define('test.ArrMut')
        class ArrMut {
            @array(number) items: number[] = []
        }

        const obj = new ArrMut()
        obj.items = [1, 2]
        obj.items.push(3)
        expect(obj.items).toEqual([1, 2, 3])

        obj.items.pop()
        expect(obj.items).toEqual([1, 2])
    })

    test('works with object elements', () => {
        const obj = new ComplexArray()
        expect(obj.items).toEqual([])

        const weapon1 = new Weapon()
        weapon1.name = 'axe'
        obj.items = [weapon1]
        expect(obj.items.length).toBe(1)
        expect(obj.items[0]!.name).toBe('axe')
    })
})

// ─── @object ─────────────────────────────────────────────────────

describe('@object()', () => {
    test('creates object property', () => {
        const player = new Inventory()
        expect(player.weapon).toBeNull()
    })

    test('allows setting object value', () => {
        const player = new Inventory()
        const weapon = new Weapon()
        weapon.damage = 50
        weapon.name = 'axe'

        player.weapon = weapon
        expect(player.weapon).not.toBeNull()
        expect(player.weapon!.damage).toBe(50)
        expect(player.weapon!.name).toBe('axe')
    })

    test('allows replacing object value', () => {
        const player = new Inventory()
        player.weapon = new Weapon()
        expect(player.weapon!.name).toBe('sword')

        const axe = new Weapon()
        axe.name = 'axe'
        player.weapon = axe
        expect(player.weapon!.name).toBe('axe')
    })

    test('allows clearing object to null', () => {
        const player = new Inventory()
        player.weapon = new Weapon()
        expect(player.weapon).not.toBeNull()

        player.weapon = null
        expect(player.weapon).toBeNull()
    })
})

// ─── makePlain / createPlain ─────────────────────────────────────

describe('makePlain', () => {
    test('creates constructor from schema', () => {
        const PositionSchema = { x: number, y: number }
        const PlainPosition = makePlain(PositionSchema)

        const pos = new PlainPosition({ x: 10, y: 20 }) as { x: number; y: number }
        expect(pos.x).toBe(10)
        expect(pos.y).toBe(20)
    })

    test('plain object is mutable reactive', () => {
        const Schema = { value: number }
        const Plain = makePlain(Schema)

        const obj = new Plain({ value: 0 }) as { value: number }
        obj.value = 42
        expect(obj.value).toBe(42)
    })

    test('isPlain detects plain objects', () => {
        const Schema = { a: number }
        const Plain = makePlain(Schema)

        const obj = new Plain({ a: 1 }) as { a: number }
        expect(isPlain(obj)).toBe(true)

        const regular = { a: 1 }
        expect(isPlain(regular)).toBe(false)
    })

    test('getPlainSchema returns schema', () => {
        const Schema = { a: number }
        const Plain = makePlain(Schema)

        const obj = new Plain({ a: 1 }) as { a: number }
        const retrieved = getPlainSchema(obj)
        expect(retrieved).toBeDefined()
    })
})

describe('createPlain', () => {
    test('creates plain object directly', () => {
        const Schema = { x: number, y: number }
        const obj = createPlain(Schema, { x: 5, y: 10 }) as { x: number; y: number }

        expect(obj.x).toBe(5)
        expect(obj.y).toBe(10)
    })

    test('creates with empty initial values', () => {
        const Schema = { a: number, b: string }
        const obj = createPlain(Schema) as { a: number; b: string }

        expect(obj.a).toBeUndefined()
        expect(obj.b).toBeUndefined()
    })
})

// ─── Signal behavior ─────────────────────────────────────────────

describe('signal behavior', () => {
    test('multiple instances have independent signals', () => {
        @define('test.Indep2')
        class Indep2 {
            @number count = 0
        }

        const a = new Indep2()
        const b = new Indep2()

        a.count = 5
        expect(a.count).toBe(5)
        expect(b.count).toBe(0)

        b.count = 10
        expect(a.count).toBe(5)
        expect(b.count).toBe(10)
    })
})
