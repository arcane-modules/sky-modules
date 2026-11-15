/**
 * @sky-modules/migration — Schema versioning and migration for reactive objects.
 *
 * Allows schema evolution with automatic data transformation.
 * Migrations are applied in order when loading data saved with an older version.
 */

export {
    registerMigration,
    registerMigrations,
    registerAlias,
    resolveClassName,
    getCurrentVersion,
    setCurrentVersion,
    getMigrationChain,
    applyMigrations,
    generateVersionTimestamp,
    clearMigrations,
    getMigrationRegistry,
} from './migration'

export type { Migration, MigrationFieldChanges, MigrationRegistry } from './types'
