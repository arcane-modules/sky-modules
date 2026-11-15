# @sky-modules/migration

Версионирование схемы и миграция данных. Миграции преобразуют данные, сохранённые по старой схеме, когда их загружает `@sky-modules/save`.

## Быстрый старт

```ts
import { registerAlias, registerMigration, setCurrentVersion } from '@sky-modules/migration'

registerMigration({
    version: '20241208_125510',
    name: 'add_user_email',
    from: '20241201_120000',
    up: {
        'app.User': {
            add: { email: '' },
        },
    },
})

setCurrentVersion('20241208_125510')

// Старое имя класса по-прежнему загружается
registerAlias('app.Player', 'app.GamePlayer')
```

## Migration

```ts
interface Migration {
    version: string // метка времени, например '20241208_125510'
    name: string
    from: string | null // предыдущая версия, null для первой
    up: Record<string, MigrationFieldChanges> // по имени класса
}
```

## Изменения полей

Для одного класса изменения применяются в таком порядке:

1. `rename`: `{ oldName: 'newName' }`.
2. `remove`: список полей для удаления.
3. `add`: значения по умолчанию, записываются только если поля нет.
4. `transform(data)`: произвольная функция, возвращающая новые данные.

## API

| Функция | Назначение |
| --- | --- |
| `registerMigration(m)` / `registerMigrations(list)` | Регистрирует миграции и перестраивает упорядоченную цепочку версий. |
| `registerAlias(oldName, newName)` | Сопоставляет старое имя класса с новым. |
| `resolveClassName(name)` | Проходит по цепочке алиасов. |
| `getCurrentVersion()` / `setCurrentVersion(v)` | Читает или задаёт текущую версию. |
| `getMigrationChain(from, to)` | Упорядоченные миграции между двумя версиями. Пусто, если версии равны, `to` равно `null` или `to` неизвестна. |
| `applyMigrations(className, data, from, to)` | Возвращает данные, преобразованные каждой миграцией цепочки. |
| `generateVersionTimestamp()` | Создаёт строку версии `YYYYMMDD_HHMMSS`. |
| `clearMigrations()` | Сбрасывает реестр (для тестов). |
| `getMigrationRegistry()` | Представление реестра только для чтения. |

Типы: `Migration`, `MigrationFieldChanges`, `MigrationRegistry`.
