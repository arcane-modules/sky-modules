# @sky-modules/testing

Helpers, benchmarks and canvas mocks for [Vitest](https://vitest.dev). The package imports `vitest`, so use it only in test files.

```ts
import { waitFor, createSpy } from '@sky-modules/testing'
```

## Helpers

| Function | Description |
| --- | --- |
| `wait(ms)` | Waits for `ms` milliseconds. |
| `waitFor(condition, timeout = 5000, interval = 50)` | Polls `condition` until it returns `true`. Throws `Timeout waiting for condition after Nms`. |
| `createSpy(implementation?)` | Thin wrapper around `vi.fn()`. |
| `mockConsole()` | Replaces `console.log`, `warn`, `error` and `info` with `vi.fn()`. Returns a function that restores them. |
| `createDeferred<T>()` | Returns `{ promise, resolve, reject }`. |
| `flushPromises()` | Resolves after a `setTimeout(0)`, so pending promises run. |
| `expectToThrow(fn)` | Runs `fn`, returns the thrown error, fails if nothing was thrown. |
| `createSequentialMock(...values)` | Mock returning the next value on each call. Throws when the values run out. |

```ts
const cleanup = mockConsole()
const error = await expectToThrow(() => {
    throw new Error('boom')
})
cleanup()
```

## Benchmarks

Wrappers around Vitest's `bench` and `describe`. Run them with `vitest bench`.

| Function | Description |
| --- | --- |
| `benchmarkFunction(name, fn, options?)` | Benchmarks one function. |
| `benchmarkCompare(name, implementations, options?)` | Benchmarks several implementations from `{ name: fn }`. |
| `benchmarkArraySizes(name, operation, generator, sizes?)` | Runs `operation` over arrays of sizes `[10, 100, 1000, 10000]` by default. |
| `createBenchmarkData(generator, count)` | Builds an array of test data. |

`BenchmarkCompareOptions`: `iterations`, `time` (ms), `warmup` (warmup iterations).

Time measurement without Vitest's `bench`:

| Function | Result |
| --- | --- |
| `measureExecutionTime(fn)` | Milliseconds spent in `fn`. |
| `averageExecutionTime(fn, iterations = 100)` | `{ average, min, max, samples }`. |
| `comparePerformance(fn1, fn2, iterations = 100)` | `{ fn1Time, fn2Time, percentageDiff, faster }`. |

## Canvas mocks

`MockCanvasRenderingContext2D` and `MockHTMLCanvasElement` implement the canvas API with `vi.fn()` methods. `setupCanvasMocks()` makes `document.createElement('canvas')` return the mock, sets `devicePixelRatio` to `1` and replaces `requestAnimationFrame` and `cancelAnimationFrame` with stubs. Call it in the test setup.

## Types

`Deferred`, `BenchmarkCompareOptions`, `BenchmarkResult`.
