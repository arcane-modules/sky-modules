export {
    wait,
    waitFor,
    createSpy,
    mockConsole,
    createDeferred,
    flushPromises,
    expectToThrow,
    createSequentialMock,
} from './helpers'
export type { Deferred } from './helpers'

export {
    benchmarkCompare,
    benchmarkFunction,
    createBenchmarkData,
    benchmarkArraySizes,
    measureExecutionTime,
    averageExecutionTime,
    comparePerformance,
} from './benchmark'
export type {
    BenchmarkCompareOptions,
    BenchmarkResult,
} from './benchmark'

export {
    MockCanvasRenderingContext2D,
    MockHTMLCanvasElement,
    setupCanvasMocks,
} from './mocks'
