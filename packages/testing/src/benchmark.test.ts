import { describe, expect, test } from 'vitest'
import { createBenchmarkData, measureExecutionTime, averageExecutionTime, comparePerformance } from './benchmark'

describe('createBenchmarkData', () => {
    test('creates array of specified length', () => {
        const data = createBenchmarkData((i) => i, 10)
        expect(data).toHaveLength(10)
        expect(data[0]).toBe(0)
        expect(data[9]).toBe(9)
    })

    test('creates objects from generator', () => {
        const data = createBenchmarkData((i) => ({ id: i, name: `item-${i}` }), 3)
        expect(data).toEqual([
            { id: 0, name: 'item-0' },
            { id: 1, name: 'item-1' },
            { id: 2, name: 'item-2' },
        ])
    })
})

describe('measureExecutionTime', () => {
    test('returns a positive number', async () => {
        const time = await measureExecutionTime(() => {
            Array.from({ length: 1000 }, (_, i) => i).reduce((sum, i) => sum + i, 0)
        })
        expect(time).toBeGreaterThanOrEqual(0)
        expect(typeof time).toBe('number')
    })
})

describe('averageExecutionTime', () => {
    test('returns average, min, max and samples', async () => {
        const result = await averageExecutionTime(() => {
            Array.from({ length: 100 }, (_, i) => i).reduce((sum, i) => sum + i, 0)
        }, 5)

        expect(result.average).toBeGreaterThanOrEqual(0)
        expect(result.min).toBeGreaterThanOrEqual(0)
        expect(result.max).toBeGreaterThanOrEqual(0)
        expect(result.samples).toHaveLength(5)
        expect(result.min).toBeLessThanOrEqual(result.average)
        expect(result.max).toBeGreaterThanOrEqual(result.average)
    })
})

describe('comparePerformance', () => {
    test('compares two functions', async () => {
        const result = await comparePerformance(
            () => {
                /* fast */
            },
            () => {
                /* slower */ for (let i = 0; i < 1000; i++) Math.sqrt(i)
            },
            3
        )

        expect(['fn1', 'fn2']).toContain(result.faster)
        expect(result.fn1Time).toBeGreaterThanOrEqual(0)
        expect(result.fn2Time).toBeGreaterThanOrEqual(0)
        expect(result.percentageDiff).toBeGreaterThanOrEqual(0)
    })
})
