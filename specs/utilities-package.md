# Пакет `@sky-modules/utilities`

## Контекст
В старом проекте `EmptySet/_inbox/sky-modules` существовал пакет `@sky-modules/utilities` с набором утилитарных функций и ре-экспортов популярных библиотек. Новый проект `ArcaneModules/sky-modules` уже имеет `packages/reactive` и `packages/arbor`. Нужно создать `packages/utilities` с собственными утилитами (без ре-экспортов сторонних библиотек).

## Цель
Создать пакет `@sky-modules/utilities` с набором standalone утилит, не зависящих от других пакетов monorepo.

## Принципы
- **Zero dependencies** — никаких внешних зависимостей, только TypeScript
- **Standalone** — не зависит от `@sky-modules/core` или других пакетов
- **Plain types** — используем `number` (ms) вместо кастомных `Time` типов
- **Native API** — используем `console` вместо обёрток, `setTimeout` вместо `sleep()`
- **Tree-shakeable** — каждая утилита отдельным файлом, импорт по пути
- **Тесты** — `src/*.test.ts` рядом с файлами

## Состав пакета

### 1. `Timer` — классы для измерения времени

#### `Timer` — базовый таймер
```typescript
import { Timer } from '@sky-modules/utilities'

const timer = new Timer('render')
// ... do work ...
timer.log() // 'render: 42ms'
timer.log('frame') // 'render: frame: 15ms'
timer.reset()
```

- `constructor(label?: string)` — создать таймер с меткой
- `reset(): this` — сбросить время
- `deltaTime(): number` — получить ms с последнего вызова deltaTime() или создания
- `log(label?: string): void` — вывести в console прошедшее время
- `trace(label?: string): void` — вывести через console.trace
- `isOn(label?: string): boolean` — проверить включён ли таймер (по label)
- `static on(label: string): void` — включить таймеры с меткой
- `static off(label: string): void` — выключить таймеры с меткой

#### `TimeoutTimer` — таймер с проверкой timeout
```typescript
const timer = new TimeoutTimer()
if (timer.timeout(5000)) {
    // 5 seconds have passed
}
```

- `timeout(ms: number): boolean` — true если указанное время прошло с последнего сброса

#### `IntervalTimer` — таймер с интервалами
```typescript
const timer = new IntervalTimer()
if (timer.interval(1000, { skipFirstTime: true })) {
    // 1 second has passed (skipped first call)
}
```

- `interval(ms: number, params?: { skipFirstTime?: boolean }): boolean`
- `reset(): this` — сбросить включая флаг interval

#### `WaitTimer` — таймер с компенсацией времени выполнения
```typescript
const timer = new WaitTimer()
await timer.wait(1000) // waits ~1000ms, compensates for execution delay
```

- `wait(ms: number): Promise<void>` — ждёт с компенсацией
- `constructor(label?: string, timer?: WaitTimer)` — копирует компенсацию из другого WaitTimer

### 2. `retry` — повтор с экспоненциальной задержкой
```typescript
import { retry } from '@sky-modules/utilities'

const data = await retry(
    () => fetch('/api/data').then(r => r.json()),
    { attempts: 5, delay: 1000, backoff: 2 }
)
```

- `retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`
- `RetryOptions`:
  - `attempts?: number` — макс. попыток (default: 3)
  - `delay?: number` — начальная задержка в ms (default: 1000)
  - `backoff?: number` — множитель (default: 2)
  - `maxDelay?: number` — макс. задержка (default: 30000)
  - `retryIf?: (error: unknown) => boolean` — фильтр ошибок для повтора
  - `onRetry?: (error: unknown, attempt: number) => void` — колбэк при повторе

### 3. `timeout` — таймаут для Promise
```typescript
import { timeout, TimeoutError } from '@sky-modules/utilities'

try {
    const result = await timeout(fetch('/api/data'), 5000)
} catch (error) {
    if (error instanceof TimeoutError) {
        console.log('Request timed out')
    }
}
```

- `timeout<T>(promise: Promise<T>, ms: number): Promise<T>`
- `TimeoutError` — класс ошибки с `name: 'TimeoutError'`

### 4. `slugify` — URL-safe slug из текста
```typescript
import { slugify } from '@sky-modules/utilities'

slugify('Hello World!')           // 'hello-world'
slugify('Привет Мир!')            // 'privet-mir'
slugify('Hello World', { separator: '_' }) // 'hello_world'
```

- Поддержка кириллицы (транслитерация)
- Unicode normalization (NFD)
- `SlugifyOptions`: `separator?`, `lowercase?`, `maxLength?`

### 5. `truncate` — обрезка текста
```typescript
import { truncate } from '@sky-modules/utilities'

truncate('Hello World', 8)        // 'Hello...'
truncate('Hello World', 8, { suffix: '…' }) // 'Hello W…'
```

- `truncate(text: string, length: number, options?: TruncateOptions): string`
- `TruncateOptions`: `suffix?` (default: '...'), `wordBoundary?` (default: true)

### 6. `template` — интерполяция строк
```typescript
import { template } from '@sky-modules/utilities'

template('Hello, {{name}}!', { name: 'World' })
// 'Hello, World!'

template('{{user.name}} works at {{company.name}}', data)
// 'Alice works at Acme'
```

- Поддержка вложенных путей: `{{user.name}}`
- Если значение не найдено — возвращает оригинальный плейсхолдер

### 7. `measurePerformance` — бенчмаркинг
```typescript
import { measurePerformance } from '@sky-modules/utilities'

measurePerformance(1000, 5, [
    ['Array.push', () => { /* ... */ }],
    ['Spread', () => { /* ... */ }],
])
```

- `measurePerformance(times: number, cycles: number, variations: [name, callback][]): void`
- Выводит результаты в console

## Структура файлов

```
packages/utilities/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── Timer/
│   │   ├── Timer.ts
│   │   ├── TimeoutTimer.ts
│   │   ├── IntervalTimer.ts
│   │   ├── WaitTimer.ts
│   │   ├── index.ts
│   │   ├── Timer.test.ts
│   │   ├── TimeoutTimer.test.ts
│   │   ├── IntervalTimer.test.ts
│   │   └── WaitTimer.test.ts
│   ├── retry.ts
│   ├── retry.test.ts
│   ├── timeout.ts
│   ├── timeout.test.ts
│   ├── slugify.ts
│   ├── slugify.test.ts
│   ├── truncate.ts
│   ├── truncate.test.ts
│   ├── template.ts
│   ├── template.test.ts
│   ├── measurePerformance.ts
│   └── measurePerformance.test.ts
```

## Критерии успеха
- [ ] Все тесты проходят
- [ ] Typecheck чист
- [ ] Нет внешних зависимостей (кроме TypeScript, vitest)
- [ ] Каждая утилита импортируется отдельно: `import { retry } from '@sky-modules/utilities'`
- [ ] API соответствует примерам выше
