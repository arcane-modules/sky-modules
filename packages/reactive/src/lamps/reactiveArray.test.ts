/**
 * Tests for reactiveArray — array with change tracking
 */

import { describe, expect, test } from 'vitest'
import { reactiveArray, getInternalArray, isReactiveArray } from './reactiveArray'
import type { ArrayChangeEvent } from './reactiveArray'

/**
 * Helper to narrow discriminated union event type
 */
function isEventOfType<E extends ArrayChangeEvent['type']>(
    event: ArrayChangeEvent,
    type: E
): event is Extract<ArrayChangeEvent, { type: E }> {
    return event.type === type
}

describe('reactiveArray()', () => {
    test('creates an array with initial values', () => {
        const arr = reactiveArray([1, 2, 3])
        expect(arr.length).toBe(3)
        expect(arr[0]).toBe(1)
        expect(arr[1]).toBe(2)
        expect(arr[2]).toBe(3)
    })

    test('creates an empty array by default', () => {
        const arr = reactiveArray()
        expect(arr.length).toBe(0)
    })

    test('push adds elements and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2], (event) => events.push(event))

        const result = arr.push(3, 4)

        expect(result).toBe(4)
        expect(arr.length).toBe(4)
        expect(arr[2]).toBe(3)
        expect(arr[3]).toBe(4)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('push')
        if (isEventOfType(events[0]!, 'push')) {
            expect(events[0]!.items).toEqual([3, 4])
        }
    })

    test('pop removes last element and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3], (event) => events.push(event))

        const item = arr.pop()

        expect(item).toBe(3)
        expect(arr.length).toBe(2)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('pop')
        if (isEventOfType(events[0]!, 'pop')) {
            expect(events[0]!.item).toBe(3)
        }
    })

    test('pop on empty array returns undefined', () => {
        const arr = reactiveArray([])
        const item = arr.pop()
        expect(item).toBeUndefined()
    })

    test('shift removes first element and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3], (event) => events.push(event))

        const item = arr.shift()

        expect(item).toBe(1)
        expect(arr.length).toBe(2)
        expect(arr[0]).toBe(2)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('shift')
        if (isEventOfType(events[0]!, 'shift')) {
            expect(events[0]!.item).toBe(1)
        }
    })

    test('unshift adds elements to beginning and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([2, 3], (event) => events.push(event))

        const result = arr.unshift(0, 1)

        expect(result).toBe(4)
        expect(arr.length).toBe(4)
        expect(arr[0]).toBe(0)
        expect(arr[1]).toBe(1)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('unshift')
        if (isEventOfType(events[0]!, 'unshift')) {
            expect(events[0]!.items).toEqual([0, 1])
        }
    })

    test('splice removes/replaces elements and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3, 4], (event) => events.push(event))

        const removed = arr.splice(1, 2, 'a' as unknown as number, 'b' as unknown as number)

        expect(removed).toEqual([2, 3])
        expect(arr.length).toBe(4)
        expect(arr[0]).toBe(1)
        expect(arr[1]).toBe('a')
        expect(arr[2]).toBe('b')
        expect(arr[3]).toBe(4)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('splice')
        if (isEventOfType(events[0]!, 'splice')) {
            expect(events[0]!.start).toBe(1)
            expect(events[0]!.deleteCount).toBe(2)
            expect(events[0]!.items).toEqual(['a', 'b'])
        }
    })

    test('clear removes all elements and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3], (event) => events.push(event))

        arr.clear()

        expect(arr.length).toBe(0)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('clear')
    })

    test('set updates value at index and triggers change', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3], (event) => events.push(event))

        arr.set(1, 99)

        expect(arr[1]).toBe(99)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('set')
        if (isEventOfType(events[0]!, 'set')) {
            expect(events[0]!.index).toBe(1)
            expect(events[0]!.value).toBe(99)
        }
    })

    test('toArray returns a copy of the underlying array', () => {
        const arr = reactiveArray([1, 2, 3])
        const copy = arr.toArray()

        expect(copy).toEqual([1, 2, 3])
        expect(copy).not.toBe(getInternalArray(arr))
    })

    test('includes checks for value presence', () => {
        const arr = reactiveArray([1, 2, 3])
        expect(arr.includes(2)).toBe(true)
        expect(arr.includes(4)).toBe(false)
    })

    test('indexOf finds value index', () => {
        const arr = reactiveArray([1, 2, 3, 2])
        expect(arr.indexOf(2)).toBe(1)
        expect(arr.indexOf(4)).toBe(-1)
    })

    test('supports iteration with for...of', () => {
        const arr = reactiveArray([1, 2, 3])
        const values: number[] = []
        for (const item of arr) {
            values.push(item as number)
        }
        expect(values).toEqual([1, 2, 3])
    })

    test('isReactiveArray detects reactive arrays', () => {
        const arr = reactiveArray([1, 2, 3])
        expect(isReactiveArray(arr)).toBe(true)
        expect(isReactiveArray([1, 2, 3])).toBe(false)
        expect(isReactiveArray(null)).toBe(false)
        expect(isReactiveArray({})).toBe(false)
    })

    test('getInternalArray returns the underlying array', () => {
        const arr = reactiveArray([1, 2, 3])
        const internal = getInternalArray(arr)
        expect(internal).toEqual([1, 2, 3])
        internal.push(4)
        expect(arr.length).toBe(4)
    })

    test('direct index assignment triggers set event', () => {
        const events: ArrayChangeEvent[] = []
        const arr = reactiveArray([1, 2, 3], (event) => events.push(event))

        arr[1] = 99

        expect(arr[1]).toBe(99)
        expect(events).toHaveLength(1)
        expect(events[0]!.type).toBe('set')
        if (isEventOfType(events[0]!, 'set')) {
            expect(events[0]!.index).toBe(1)
            expect(events[0]!.value).toBe(99)
        }
    })
})
