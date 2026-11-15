# Reactive библиотека для Sky Modules

## Контекст
В старом проекте `EmptySet/_inbox/sky-modules` существовала мощная reactive-система на базе SolidJS signals. Она предоставляла:
- Декораторы типов: `@number`, `@string`, `@boolean`, `@array`, `@object` и др.
- Модификаторы sync: `@read`, `@write`, `@secret`
- Валидацию: `@number.min(0).max(100)`, `@string.email()`
- Share-систему: автоматическая сериализация дельт (CREATE, DESTROY, SET, ARRAY_SPLICE)
- ReactiveArray: перехват методов массива для sync
- Define-систему: `@define('game.Player')` для регистрации классов с ID

Новый проект `ArcaneModules/sky-modules` почти пустой — есть только `arbor`. Нужно создать `@sky-modules/reactive` с аналогичным функционалом.

## Цель
Создать пакет `@sky-modules/reactive` с fine-grained reactive системой на SolidJS signals, декораторами типов, валидацией и share-синхронизацией.

## Scope — фазы реализации

### Фаза 1: Core Reactive (MVP)
- SolidJS signals (`createSignal` из `solid-js/dist/solid.js`)
- `reactivePropertyDescriptor()` — lazy signal per property
- Декораторы: `@number`, `@string`, `@boolean`, `@bigint`, `@symbol`, `@date`
- Коллекции: `@array(type)`, `@object(Class)`, `@map(k, v)`, `@set(v)`
- `makePlain()` — конструктор plain-объектов из схемы
- `define()` — регистрация классов с ID и schema

### Фаза 2: Модификаторы + Валидация
- Модификаторы: `read(type)`, `write(type)`, `secret(type)`
- Chainable валидация: `.min()`, `.max()`, `.email()`, `.pattern()`, `.refine()`
- `validate(obj)` — batch validation
- Кастомные расширения: `number.extend(name, fn, message)`

### Фаза 3: Сетевые лампы (Network Lamps)
- `NetworkLamp` — базовый класс с reactive state и синхронизацией
- `onSync(callback)` — подписка на изменения **только своего** state
- Каждая лампа — изолированная единица синхронизации
- **Нет волны по графу** — вложенные define-объекты синхронизируются как значения (serialize/deserialize), а не как графовые узлы
- Дельты: только SET (изменения state самой лампы)
- Никаких CREATE, DESTROY, ARRAY_SPLICE дельт с графовыми ID — только `key: value` в state

### Фаза 4: Reactive Array
- `reactiveArray()` — массив с триггером onUpdate
- Используется внутри лампы для синхронизации списков
- Перехват: push, pop, splice, shift, unshift, length
- Генерирует событие для onSync лампы

## Что изменится

### Новые файлы
```
packages/reactive/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── README.ru.md
├── src/
│   ├── index.ts                    # Public API
│   ├── define.ts                   # @define decorator + registry
│   ├── reactive.ts                 # reactivePropertyDescriptor + signals
│   ├── types.ts                    # @number, @string, @boolean decorators
│   ├── validation.ts               # Validator builders
│   ├── modifiers.ts                # read, write, secret
│   ├── share.ts                    # share() + delta generation
│   ├── ReactiveArray.ts            # Array proxy with splice tracking
│   ├── plain.ts                    # makePlain, createPlain
│   ├── internal/
│   │   ├── symbols.ts              # idSymbol, uidSymbol, etc.
│   │   ├── state.ts                # defines registry, loadedDefines
│   │   └── hooks.ts                # registerPropertyDescriptorHook
│   ├── lamps/
│   │   ├── index.ts                # Public API ламп
│   │   ├── SignalLamp.ts           # Базовый класс лампы
│   │   ├── reactiveArray.ts        # Массив с onChange
│   │   └── signal.ts               # signal() — reactive value wrapper
│   ├── __spec__/
│   │   ├── reactive.spec.ts
│   │   ├── validation.spec.ts
│   │   ├── share.spec.ts
│   │   └── reactive-nested.spec.ts
```

### Изменения в корне
- `pnpm-workspace.yaml` — добавить `packages/*`

## Детали реализации

### 1. Package structure
```json
{
    "name": "@sky-modules/reactive",
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
        ".": "./src/index.ts",
        "./define": "./src/define.ts"
    },
    "dependencies": {
        "solid-js": "^1.9.10"
    },
    "devDependencies": {
        "vitest": "*",
        "typescript": "*"
    }
}
```

### 2. Сигналы
- Импорт: `import { createSignal } from 'solid-js/dist/solid.js'`
- Lazy creation: сигнал создаётся при первом `get`/`set`
- Каждое свойство получает уникальный `Symbol(propName)`
- `rawSetterSymbol` — хранит прямые setters для `rawSet()`

### 3. Декораторы
```typescript
@define('game.Player')
class Player {
    @number health = 100
    @string name = ''
    @boolean isActive = true
    @array(number) scores = []
    @object(Weapon) weapon: Weapon | null = null
}
```

### 4. Модификаторы
```typescript
@read.number health = 100      // только сервер→клиент
@write.number inputX = 0       // двусторонний
@secret.string token = ''      // не синхронизируется
```

### 5. Валидация
```typescript
@number.min(0).max(100) health = 100
@string.email().nonEmpty() email = ''
@array(number).minLength(1).unique() scores = []
```

### 6. Сетевые лампы
```typescript
import { SignalLamp } from '@sky-modules/reactive/lamps'

class PlayerLamp extends SignalLamp {
    state = signal({
        health: 100,
        name: '',
        weapon: null as Weapon | null,  // сериализуется как value
    })
}

const lamp = new PlayerLamp()
lamp.onSync((delta) => {
    // delta.health = 50
    // delta.name = 'New Name'
    // Никаких CREATE/DESTROY — вложенные объекты как JSON
})

lamp.state.health = 50  // → { health: 50 }
```

### 7. ReactiveArray
- Array-like с `onChange` колбэком
- Хранится в state как value
- push/pop/splice генерируют события для SyncLamp
- **Не проталкивает ID в граф** — просто сериализует содержимое

## Критерии приёмки

### Фаза 1
- [ ] `@number`, `@string`, `@boolean` декораторы создают reactive свойства
- [ ] Изменение свойства обновляет значение (через signal)
- [ ] `@array(number)` создаёт массив с reactive элементами
- [ ] `@object(Weapon)` создаёт вложенный reactive объект
- [ ] `define('name', Class)` регистрирует класс с ID
- [ ] `makePlain(schema)` создаёт конструктор из схемы

### Фаза 2
- [ ] `@number.min(0).max(100)` валидирует значение
- [ ] `validate(player)` возвращает `{ valid, errors }`
- [ ] `read(number)`, `write(number)`, `secret(number)` работают как модификаторы
- [ ] Кастомные расширения: `number.extend('positive', v => v > 0, 'Must be positive')`

### Фаза 3 (Сетевые лампы)
- [ ] `SignalLamp` создаётся с начальным state
- [ ] Изменение state через сигнал триггерит `onSync` с дельтой
- [ ] Вложенные объекты сериализуются как JSON, без графовых ID
- [ ] `lamp.state.name = 'foo'` → `onSync({ name: 'foo' })`

### Фаза 4 (Reactive Array)
- [ ] `reactiveArray()` создаёт массив с onChange
- [ ] push/pop/splice генерируют события
- [ ] Массивы внутри лампы синхронизируются как value
- [ ] `committed()` — await flush синхронизации
