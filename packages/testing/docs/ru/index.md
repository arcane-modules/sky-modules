# @sky-modules/testing

Помощники, бенчмарки и моки canvas для [Vitest](https://vitest.dev). Пакет импортирует `vitest`, поэтому используйте его только в тестовых файлах.

```ts
import { waitFor, createSpy } from '@sky-modules/testing'
```

## Помощники

| Функция | Описание |
| --- | --- |
| `wait(ms)` | Ждёт `ms` миллисекунд. |
| `waitFor(condition, timeout = 5000, interval = 50)` | Опрашивает `condition`, пока она не вернёт `true`. Выбрасывает `Timeout waiting for condition after Nms`. |
| `createSpy(implementation?)` | Тонкая обёртка над `vi.fn()`. |
| `mockConsole()` | Заменяет `console.log`, `warn`, `error` и `info` на `vi.fn()`. Возвращает функцию, восстанавливающую их. |
| `createDeferred<T>()` | Возвращает `{ promise, resolve, reject }`. |
| `flushPromises()` | Выполняется после `setTimeout(0)`, чтобы отработали ожидающие промисы. |
| `expectToThrow(fn)` | Запускает `fn`, возвращает выброшенную ошибку, падает, если ничего не выброшено. |
| `createSequentialMock(...values)` | Мок, возвращающий следующее значение при каждом вызове. Выбрасывает ошибку, когда значения закончились. |

```ts
const cleanup = mockConsole()
const error = await expectToThrow(() => {
    throw new Error('boom')
})
cleanup()
```

## Бенчмарки

Обёртки над `bench` и `describe` из Vitest. Запускайте через `vitest bench`.

| Функция | Описание |
| --- | --- |
| `benchmarkFunction(name, fn, options?)` | Бенчмарк одной функции. |
| `benchmarkCompare(name, implementations, options?)` | Бенчмарк нескольких реализаций из `{ name: fn }`. |
| `benchmarkArraySizes(name, operation, generator, sizes?)` | Запускает `operation` на массивах размеров `[10, 100, 1000, 10000]` по умолчанию. |
| `createBenchmarkData(generator, count)` | Строит массив тестовых данных. |

`BenchmarkCompareOptions`: `iterations`, `time` (мс), `warmup` (прогревочные итерации).

Измерение времени без `bench` из Vitest:

| Функция | Результат |
| --- | --- |
| `measureExecutionTime(fn)` | Миллисекунды, потраченные в `fn`. |
| `averageExecutionTime(fn, iterations = 100)` | `{ average, min, max, samples }`. |
| `comparePerformance(fn1, fn2, iterations = 100)` | `{ fn1Time, fn2Time, percentageDiff, faster }`. |

## Моки canvas

`MockCanvasRenderingContext2D` и `MockHTMLCanvasElement` реализуют API canvas на методах `vi.fn()`. `setupCanvasMocks()` заставляет `document.createElement('canvas')` возвращать мок, ставит `devicePixelRatio` равным `1` и заменяет `requestAnimationFrame` и `cancelAnimationFrame` заглушками. Вызывайте её в настройке тестов.

## Типы

`Deferred`, `BenchmarkCompareOptions`, `BenchmarkResult`.
