# @sky-modules/migration

Schema versioning and data migration. Migrations transform data saved with an older schema when it is loaded by `@sky-modules/save`.

## Quick start

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

// An old class name still loads
registerAlias('app.Player', 'app.GamePlayer')
```

## Migration

```ts
interface Migration {
    version: string // timestamp, for example '20241208_125510'
    name: string
    from: string | null // previous version, null for the first one
    up: Record<string, MigrationFieldChanges> // keyed by class name
}
```

## Field changes

For one class, changes are applied in this order:

1. `rename`: `{ oldName: 'newName' }`.
2. `remove`: list of fields to delete.
3. `add`: defaults, written only when the field is missing.
4. `transform(data)`: custom function that returns the new data.

## API

| Function | Purpose |
| --- | --- |
| `registerMigration(m)` / `registerMigrations(list)` | Registers migrations and rebuilds the ordered version chain. |
| `registerAlias(oldName, newName)` | Maps an old class name to a new one. |
| `resolveClassName(name)` | Follows the alias chain. |
| `getCurrentVersion()` / `setCurrentVersion(v)` | Reads or sets the current version. |
| `getMigrationChain(from, to)` | Ordered migrations between two versions. Empty when versions are equal, `to` is `null`, or `to` is unknown. |
| `applyMigrations(className, data, from, to)` | Returns the data transformed by every migration in the chain. |
| `generateVersionTimestamp()` | Creates a version string `YYYYMMDD_HHMMSS`. |
| `clearMigrations()` | Resets the registry (for tests). |
| `getMigrationRegistry()` | Read-only view of the registry. |

Types: `Migration`, `MigrationFieldChanges`, `MigrationRegistry`.
