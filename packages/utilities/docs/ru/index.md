# @sky-modules/utilities

Небольшие помощники без зависимостей: таймеры, управление асинхронностью, текст, композиция и эмиттер событий.

```ts
import { retry, sleep, slugify } from '@sky-modules/utilities'
```

## Асинхронность

| Функция | Описание |
| --- | --- |
| `sleep(ms)` | Выполняется через `ms` миллисекунд. |
| `timeout(promise, ms)` | Отклоняется с `TimeoutError`, если промис не завершился вовремя. |
| `retry(fn, options?)` | Повторяет вызов `fn` при ошибке с экспоненциальной задержкой. |
| `deferred<T>()` | Возвращает `[promise, resolve, reject]` для внешнего управления. |
| `repeat(count, callback, ...args)` | Вызывает `callback(i, ...args)` `count` раз, дожидаясь промисов. |
| `justTry(fn)` | Результат или `undefined`, если `fn` выбросила ошибку. |
| `switchThread()` | Выполненный промис, чтобы уступить цикл событий. |

Опции `retry`:

| Опция | По умолчанию | Значение |
| --- | --- | --- |
| `attempts` | `3` | Максимальное число попыток. |
| `delay` | `1000` | Задержка в мс перед первым повтором. |
| `backoff` | `2` | Множитель задержки. |
| `maxDelay` | `30000` | Верхняя граница задержки. |
| `retryIf` | все ошибки | Верните `false`, чтобы прекратить повторы. |
| `onRetry` | нет | Вызывается с `(error, attempt)` перед ожиданием. |

```ts
const data = await retry(() => fetch('/api').then((r) => r.json()), { attempts: 5 })
```

## Текст

| Функция | Описание |
| --- | --- |
| `slugify(text, options?)` | Безопасный для URL слаг. Транслитерирует кириллицу и убирает диакритику. Опции: `separator` (`-`), `lowercase` (`true`), `maxLength`. |
| `truncate(text, length, options?)` | Сокращает текст с суффиксом. Опции: `suffix` (`...`), `wordBoundary` (`true`). |
| `template(str, data)` | Заменяет плейсхолдеры <code v-pre>{{key}}</code> и <code v-pre>{{a.b}}</code>. Отсутствующие значения остаются как есть. |

```ts
slugify('Привет Мир!') // 'privet-mir'
truncate('Hello World', 8) // 'Hello...'
template('Hello, {{user.name}}!', { user: { name: 'Anna' } }) // 'Hello, Anna!'
```

## Функции

- `pipe(value, ...fns)` применяет функции слева направо (типизировано до восьми функций).
- `flow(...fns)` возвращает составную функцию.
- `identity(x)` возвращает свой аргумент.

## Проверки

`assert(expression, message)` выбрасывает `AssertionError` (`assertion failed: <message>`) и сужает типы через `asserts expression`.

## Таймеры

Все таймеры поддерживают метку и могут отключаться по метке: `TimerBase.off('label')` и `TimerBase.on('label')`.

| Класс | Ключевой метод |
| --- | --- |
| `Timer` | `deltaTime()` возвращает мс с прошлого вызова, `log(label?)`, `trace(label?)`, `reset()`. |
| `TimeoutTimer` | `timeout(ms)` возвращает `true`, когда прошло `ms` (и сдвигается на `ms`). |
| `IntervalTimer` | `interval(ms, { skipFirstTime? })` возвращает `true` на каждом прошедшем интервале. |
| `WaitTimer` | `wait(ms)` ждёт и компенсирует время, потраченное между вызовами. |

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

Методы: `on`, `onAny` (первым аргументом получает имя события), `off`, `offAll`, `emit`. Все возвращают `this`. Удаление слушателя во время `emit` откладывается до его завершения.

## Бенчмарки

`measurePerformance(times, cyclesCount, [[name, callback], ...])` запускает каждый вариант и печатает в консоль среднее время за цикл.
