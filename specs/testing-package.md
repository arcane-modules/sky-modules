# Пакет `@sky-modules/testing`

## Контекст
В старом проекте `EmptySet/_inbox/sky-modules` существовал пакет `@sky-modules/testing` с набором утилит для тестирования: helpers, benchmark, mocks (canvas, memfs), define-testing, e2e.

Новый пакет будет standalone, без зависимостей от других пакетов monorepo. Зависимость только от `vitest`.

## Цель
Создать пакет `@sky-modules/testing` с:
1. **Helpers** — общие тестовые утилиты (wait, waitFor, createSpy, mockConsole, createDeferred, flushPromises, expectToThrow, createSequentialMock)
2. **Benchmark** — утилиты для бенчмаркинга (benchmarkCompare, benchmarkFunction, measureExecutionTime, averageExecutionTime, comparePerformance)
3. **Mocks** — моки для canvas (MockCanvasRenderingContext2D, MockHTMLCanvasElement, setupCanvasMocks)

## Принципы
- **Zero dependencies** (кроме `vitest` как devDependency)
- **Standalone** — не зависит от других пакетов
- **Tree-shakeable** — каждый модуль отдельным файлом

## Состав

### 1. Helpers

```typescript
import {
    wait,
    waitFor,
    createSpy,
    mockConsole,
    createDeferred,
    flushPromises,
    expectToThrow,
    createSequentialMock,
} from '@sky-modules/testing'
```

- **`wait(ms: number): Promise<void>`** — ожидание N миллисекунд
- **`waitFor(condition, timeout?, interval?): Promise<void>`** — ожидание условия
- **`createSpy<T>(implementation?): vi.fn`** — обёртка над `vi.fn()`
- **`mockConsole(): () => void`** — мок console.log/warn/error/info, возвращает cleanup
- **`createDeferred<T>(): { promise, resolve, reject }`** — deferred promise
- **`flushPromises(): Promise<void>`** — сброс всех pending promises
- **`expectToThrow<E>(fn): Promise<E>`** — ожидание ошибки
- **`createSequentialMock<T>(...values): vi.fn`** — последовательные возвраты

### 2. Benchmark

```typescript
import {
    benchmarkCompare,
    benchmarkFunction,
    createBenchmarkData,
    benchmarkArraySizes,
    measureExecutionTime,
    averageExecutionTime,
    comparePerformance,
} from '@sky-modules/testing'
```

- **`benchmarkCompare(name, implementations, options?)`** — сравнение нескольких реализаций
- **`benchmarkFunction(name, fn, options?)`** — бенчмарк одной функции
- **`createBenchmarkData<T>(generator, count): T[]`** — генерация тестовых данных
- **`benchmarkArraySizes(name, operation, dataGenerator, sizes?)`** — бенчмарк разных размеров
- **`measureExecutionTime(fn): Promise<number>`** — замер времени выполнения
- **`averageExecutionTime(fn, iterations?): Promise<{ average, min, max, samples }>`** — среднее время
- **`comparePerformance(fn1, fn2, iterations?): Promise<{ fn1Time, fn2Time, percentageDiff, faster }>`** — сравнение производительности

### 3. Mocks (Canvas)

```typescript
import {
    MockCanvasRenderingContext2D,
    MockHTMLCanvasElement,
    setupCanvasMocks,
} from '@sky-modules/testing'
```

- **`MockCanvasRenderingContext2D`** — мок контекста canvas 2D
- **`MockHTMLCanvasElement`** — мок HTMLCanvasElement
- **`setupCanvasMocks(): void`** — установка моков в глобальный скоуп

## Структура файлов

```
packages/testing/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── helpers.ts
│   ├── helpers.test.ts
│   ├── benchmark.ts
│   ├── benchmark.test.ts
│   ├── mocks/
│   │   ├── index.ts
│   │   ├── canvas.ts
│   │   └── canvas.test.ts
```

## Критерии успеха
- [ ] Все тесты проходят
- [ ] Typecheck чист
- [ ] Zero dependencies (кроме vitest)
- [ ] API соответствует примерам