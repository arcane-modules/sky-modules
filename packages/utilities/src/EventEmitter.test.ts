import { describe, expect, test } from 'vitest'
import { EventEmitter } from './EventEmitter'

interface Events {
    click: [x: number, y: number]
    change: [value: string]
}

describe('EventEmitter', () => {
    test('on and emit with arguments', () => {
        const emitter = new EventEmitter<Events>()
        const calls: Array<[number, number]> = []

        emitter.on('click', (x, y) => calls.push([x, y]))
        emitter.emit('click', 10, 20)

        expect(calls).toEqual([[10, 20]])
    })

    test('off removes listener', () => {
        const emitter = new EventEmitter<Events>()
        const calls: string[] = []

        const handler = (v: string) => calls.push(v)
        emitter.on('change', handler)
        emitter.emit('change', 'a')

        emitter.off('change', handler)
        emitter.emit('change', 'b')

        expect(calls).toEqual(['a'])
    })

    test('offAll removes all listeners', () => {
        const emitter = new EventEmitter<Events>()
        const calls: string[] = []

        emitter.on('change', (v) => calls.push(v))
        emitter.offAll()
        emitter.emit('change', 'test')

        expect(calls).toEqual([])
    })

    test('onAny catches all events', () => {
        const emitter = new EventEmitter<Events>()
        const calls: Array<[string, ...unknown[]]> = []

        emitter.onAny((...args) => calls.push(args))
        emitter.emit('click', 1, 2)
        emitter.emit('change', 'test')

        expect(calls[0]?.[0]).toBe('click')
        expect(calls[0]?.[1]).toBe(1)
        expect(calls[0]?.[2]).toBe(2)
        expect(calls[1]?.[0]).toBe('change')
        expect(calls[1]?.[1]).toBe('test')
    })

    test('off during emit defers removal', () => {
        const emitter = new EventEmitter<Events>()
        const calls: number[] = []

        const handler1 = () => {
            calls.push(1)
            emitter.off('change', handler2)
        }
        const handler2 = () => calls.push(2)

        emitter.on('change', handler1)
        emitter.on('change', handler2)
        emitter.emit('change', 'test')

        // Both fire during emit since removal is deferred
        expect(calls).toEqual([1, 2])

        // Second emit shouldn't call handler2 anymore
        emitter.emit('change', 'test2')
        expect(calls).toEqual([1, 2, 1])
    })
})
