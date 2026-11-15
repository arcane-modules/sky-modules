import { describe, expect, test, beforeEach } from 'vitest'
import define from './define'
import { defines, loadedDefines, setUniqueId, getUniqueId } from './internal/state'
import { setRuntime, setHot } from './internal/runtime'
import { idSymbol, typeSymbol, nameSymbol, uidSymbol } from './internal/symbols'

beforeEach(() => {
    // Reset state
    for (const key of Object.keys(defines)) {
        delete defines[key]
    }
    for (const key of Object.keys(loadedDefines)) {
        delete loadedDefines[key]
    }
    setUniqueId(1)
    setRuntime(false)
    setHot(false)
})

describe('define() as function', () => {
    test('registers a function', () => {
        function helper() {
            return 'help'
        }

        const result = define('app.utils.helper', helper)
        expect(result).toBe(helper)
        expect(defines['app.utils.helper']).toBeDefined()
        expect(defines['app.utils.helper']!.value).toBe(helper)
    })

    test('registers an object', () => {
        const config = { apiUrl: 'https://api.example.com' }
        const result = define('app.config', config)
        expect(result).toBe(config)
        expect(defines['app.config']).toBeDefined()
        expect(defines['app.config']!.value).toBe(config)
    })

    test('sets type symbol on function', () => {
        function fn() {}
        define('app.fn', fn)
        expect((fn as unknown as Record<symbol, string>)[typeSymbol]).toBe('func')
    })

    test('sets type symbol on object', () => {
        const obj = {}
        define('app.obj', obj)
        expect((obj as unknown as Record<symbol, string>)[typeSymbol]).toBe('object')
    })

    test('sets type symbol on array', () => {
        const arr: Array<number> = []
        define('app.arr', arr)
        expect((arr as unknown as Record<symbol, string>)[typeSymbol]).toBe('array')
    })

    test('sets name and uid symbols', () => {
        const obj = {}
        define('app.MyModule', obj)
        const sym = obj as unknown as Record<symbol, string>
        expect(sym[nameSymbol]).toBe('MyModule')
        expect(sym[uidSymbol]).toBe('app.MyModule')
    })

    test('throws on invalid name', () => {
        expect(() => define('123invalid', {})).toThrow('Invalid define name')
    })

    test('throws on duplicate at runtime', () => {
        // First define during module loading (not runtime)
        define('app.test', {})
        setRuntime(true)
        expect(() => define('app.test', {})).toThrow('Duplicate define')
    })

    test('allows duplicate during HMR', () => {
        setRuntime(true)
        setHot(true)
        define('app.test', {})
        expect(() => define('app.test', {})).not.toThrow()
    })

    test('throws on runtime define without HMR', () => {
        setRuntime(true)
        expect(() => define('app.test', {})).toThrow('Cannot define at runtime')
    })
})

describe('define() as decorator', () => {
    test('registers a class', () => {
        @define('app.MyService')
        class MyService {
            doSomething() {}
        }

        expect(defines['app.MyService']).toBeDefined()
        expect(defines['app.MyService']!.value).toBe(MyService)
    })

    test('sets type symbol to class', () => {
        @define('app.MyClass')
        class MyClass {}

        const cls = MyClass as unknown as Record<symbol, string>
        expect(cls[typeSymbol]).toBe('class')
    })

    test('sets name and uid symbols', () => {
        @define('app.MyService')
        class MyService {}

        const cls = MyService as unknown as Record<symbol, string>
        expect(cls[nameSymbol]).toBe('MyService')
        expect(cls[uidSymbol]).toBe('app.MyService')
    })

    test('auto-generates numeric ID', () => {
        @define('app.WithId')
        class WithId {}

        const cls = WithId as unknown as Record<symbol, number>
        expect(cls[idSymbol]).toBeGreaterThanOrEqual(1)
    })

    test('uses loaded ID when available', () => {
        loadedDefines['app.Preloaded'] = 42

        @define('app.Preloaded')
        class Preloaded {}

        const cls = Preloaded as unknown as Record<symbol, number>
        expect(cls[idSymbol]).toBe(42)
    })

    test('throws on invalid name', () => {
        expect(() => {
            @define('123bad')
            // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
            class Bad {}
        }).toThrow('Invalid define name')
    })
})

describe('define() edge cases', () => {
    test('increments unique ID', () => {
        const id1 = getUniqueId()
        @define('app.ClassA')
        // biome-ignore lint/correctness/noUnusedVariables: the class is registered by its decorator
        class ClassA {}
        const id2 = getUniqueId()
        expect(id2).toBe(id1 + 1)
    })

    test('allows defining after successful registration (stack cleanup)', () => {
        // First define succeeds and pops from stack
        define('app.first', {})
        // Second define with different name should work
        expect(() => define('app.second', {})).not.toThrow()
    })
})
