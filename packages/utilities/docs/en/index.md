# @sky-modules/utilities

Small dependency-free helpers: timers, async control, text, composition and an event emitter.

```ts
import { retry, sleep, slugify } from '@sky-modules/utilities'
```

## Async

| Function | Description |
| --- | --- |
| `sleep(ms)` | Resolves after `ms` milliseconds. |
| `timeout(promise, ms)` | Rejects with `TimeoutError` when the promise does not settle in time. |
| `retry(fn, options?)` | Calls `fn` again on failure with exponential backoff. |
| `deferred<T>()` | Returns `[promise, resolve, reject]` for external control. |
| `repeat(count, callback, ...args)` | Calls `callback(i, ...args)` `count` times, awaiting promises. |
| `justTry(fn)` | Resolves to the result or `undefined` if `fn` throws. |
| `switchThread()` | Resolved promise, to yield to the event loop. |

`retry` options:

| Option | Default | Meaning |
| --- | --- | --- |
| `attempts` | `3` | Maximum number of attempts. |
| `delay` | `1000` | Delay in ms before the first retry. |
| `backoff` | `2` | Delay multiplier. |
| `maxDelay` | `30000` | Upper bound of the delay. |
| `retryIf` | all errors | Return `false` to stop retrying. |
| `onRetry` | none | Called with `(error, attempt)` before waiting. |

```ts
const data = await retry(() => fetch('/api').then((r) => r.json()), { attempts: 5 })
```

## Text

| Function | Description |
| --- | --- |
| `slugify(text, options?)` | URL-safe slug. Transliterates Cyrillic and strips diacritics. Options: `separator` (`-`), `lowercase` (`true`), `maxLength`. |
| `truncate(text, length, options?)` | Shortens text with a suffix. Options: `suffix` (`...`), `wordBoundary` (`true`). |
| `template(str, data)` | Replaces <code v-pre>{{key}}</code> and <code v-pre>{{a.b}}</code> placeholders. Missing values stay as they are. |

```ts
slugify('Привет Мир!') // 'privet-mir'
truncate('Hello World', 8) // 'Hello...'
template('Hello, {{user.name}}!', { user: { name: 'Anna' } }) // 'Hello, Anna!'
```

## Functions

- `pipe(value, ...fns)` applies functions left to right (typed up to eight functions).
- `flow(...fns)` returns the composed function.
- `identity(x)` returns its argument.

## Assertions

`assert(expression, message)` throws `AssertionError` (`assertion failed: <message>`) and narrows types with `asserts expression`.

## Timers

All timers support a label and can be muted per label: `TimerBase.off('label')` and `TimerBase.on('label')`.

| Class | Key method |
| --- | --- |
| `Timer` | `deltaTime()` returns ms since the last call, `log(label?)`, `trace(label?)`, `reset()`. |
| `TimeoutTimer` | `timeout(ms)` returns `true` once `ms` have passed (and advances by `ms`). |
| `IntervalTimer` | `interval(ms, { skipFirstTime? })` returns `true` on every elapsed interval. |
| `WaitTimer` | `wait(ms)` sleeps and compensates for time spent between calls. |

## EventEmitter

```ts
import { EventEmitter } from '@sky-modules/utilities'

interface Events {
    click: [x: number, y: number]
}

const emitter = new EventEmitter<Events>()
emitter.on('click', (x, y) => console.log(x, y))
emitter.emit('click', 10, 20)
```

Methods: `on`, `onAny` (receives the event name first), `off`, `offAll`, `emit`. All return `this`. Removing a listener during `emit` is deferred until the emit finishes.

## Benchmarking

`measurePerformance(times, cyclesCount, [[name, callback], ...])` runs each variation and prints the average time per cycle to the console.
