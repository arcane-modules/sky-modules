import { bench, describe } from 'vitest'

/**
 * @global
 * Options for benchmark comparison.
 *
 * @interface BenchmarkCompareOptions - Configuration for benchmark tests.
 */
export interface BenchmarkCompareOptions {
    /**
     * Number of iterations to run.
     */
    iterations?: number

    /**
     * Time to run the benchmark in milliseconds.
     */
    time?: number

    /**
     * Warmup iterations before actual measurement.
     */
    warmup?: number
}

/**
 * @global
 * Result of a benchmark run.
 *
 * @interface BenchmarkResult - Benchmark test results.
 */
export interface BenchmarkResult {
    /**
     * Benchmark name.
     */
    name: string

    /**
     * Operations per second.
     */
    ops: number

    /**
     * Mean execution time in ms.
     */
    mean: number

    /**
     * Number of samples collected.
     */
    samples: number
}

/**
 * @global
 * Compare multiple implementations of the same functionality.
 *
 * @param name - Benchmark name.
 * @param implementations - Map of implementation names to functions.
 * @param options - Optional benchmark options.
 */
export function benchmarkCompare(
    name: string,
    implementations: Record<string, () => void | Promise<void>>,
    options?: BenchmarkCompareOptions
): void {
    describe(name, () => {
        for (const [implName, impl] of Object.entries(implementations)) {
            bench(
                implName,
                impl,
                options
                    ? {
                          ...(options.iterations !== undefined && {
                              iterations: options.iterations,
                          }),
                          ...(options.time !== undefined && { time: options.time }),
                          ...(options.warmup !== undefined && { warmupIterations: options.warmup }),
                      }
                    : undefined
            )
        }
    })
}

/**
 * Benchmark a single function.
 *
 * @example
 * ```typescript
 * import { benchmarkFunction } from '@sky-modules/testing'
 *
 * benchmarkFunction('my-fn', () => {
 *     // code to benchmark
 * })
 * ```
 */
export function benchmarkFunction(
    name: string,
    fn: () => void | Promise<void>,
    options?: BenchmarkCompareOptions
): void {
    bench(
        name,
        fn,
        options
            ? {
                  ...(options.iterations !== undefined && { iterations: options.iterations }),
                  ...(options.time !== undefined && { time: options.time }),
                  ...(options.warmup !== undefined && { warmupIterations: options.warmup }),
              }
            : undefined
    )
}

/**
 * Create test data for benchmarks.
 *
 * @example
 * ```typescript
 * import { createBenchmarkData } from '@sky-modules/testing'
 *
 * const data = createBenchmarkData(i => ({ id: i }), 1000)
 * ```
 */
export function createBenchmarkData<T>(generator: (index: number) => T, count: number): Array<T> {
    return Array.from({ length: count }, (_, i) => generator(i))
}

/**
 * Benchmark different array sizes.
 *
 * @example
 * ```typescript
 * import { benchmarkArraySizes } from '@sky-modules/testing'
 *
 * benchmarkArraySizes('find', data => data.find(x => x > 50), i => i, [10, 100, 1000])
 * ```
 */
export function benchmarkArraySizes<T>(
    name: string,
    operation: (data: Array<T>) => void,
    dataGenerator: (index: number) => T,
    sizes: Array<number> = [10, 100, 1000, 10000]
): void {
    describe(name, () => {
        for (const size of sizes) {
            const data = createBenchmarkData(dataGenerator, size)
            bench(`${name} (size: ${size})`, () => {
                operation(data)
            })
        }
    })
}

/**
 * Measure execution time of a function in milliseconds.
 *
 * @example
 * ```typescript
 * import { measureExecutionTime } from '@sky-modules/testing'
 *
 * const time = await measureExecutionTime(() => heavyComputation())
 * console.log(`Took ${time}ms`)
 * ```
 */
export async function measureExecutionTime(fn: () => void | Promise<void>): Promise<number> {
    const start = performance.now()
    await fn()
    const end = performance.now()
    return end - start
}

/**
 * Run a function multiple times and get average execution time.
 *
 * @example
 * ```typescript
 * import { averageExecutionTime } from '@sky-modules/testing'
 *
 * const result = await averageExecutionTime(() => heavyComputation(), 50)
 * console.log(`Average: ${result.average}ms, min: ${result.min}ms, max: ${result.max}ms`)
 * ```
 */
export async function averageExecutionTime(
    fn: () => void | Promise<void>,
    iterations = 100
): Promise<{
    average: number
    min: number
    max: number
    samples: Array<number>
}> {
    const samples: Array<number> = []

    for (let i = 0; i < iterations; i++) {
        const time = await measureExecutionTime(fn)
        samples.push(time)
    }

    const average = samples.reduce((sum, time) => sum + time, 0) / samples.length
    const min = Math.min(...samples)
    const max = Math.max(...samples)

    return { average, min, max, samples }
}

/**
 * Compare performance of two functions.
 * Returns percentage difference (positive means fn1 is faster).
 *
 * @example
 * ```typescript
 * import { comparePerformance } from '@sky-modules/testing'
 *
 * const result = await comparePerformance(fn1, fn2, 50)
 * console.log(`${result.faster} is ${result.percentageDiff.toFixed(1)}% faster`)
 * ```
 */
export async function comparePerformance(
    fn1: () => void | Promise<void>,
    fn2: () => void | Promise<void>,
    iterations = 100
): Promise<{
    fn1Time: number
    fn2Time: number
    percentageDiff: number
    faster: 'fn1' | 'fn2'
}> {
    const result1 = await averageExecutionTime(fn1, iterations)
    const result2 = await averageExecutionTime(fn2, iterations)

    const percentageDiff = ((result2.average - result1.average) / result1.average) * 100
    const faster = result1.average < result2.average ? 'fn1' : 'fn2'

    return {
        fn1Time: result1.average,
        fn2Time: result2.average,
        percentageDiff: Math.abs(percentageDiff),
        faster,
    }
}
