/**
 * Types for the migration system.
 * Migrations allow schema evolution with automatic data transformation.
 */

/**
 * Declarative field changes in a migration.
 */
export interface MigrationFieldChanges {
    /** Add new fields with default values */
    add?: Record<string, unknown>
    /** Rename fields (old name → new name) */
    rename?: Record<string, string>
    /** Remove fields */
    remove?: string[]
    /** Custom transform function for complex migrations */
    transform?: (data: Record<string, unknown>) => Record<string, unknown>
}

/**
 * A single migration definition.
 */
export interface Migration {
    /** Version timestamp (e.g., '20241208_125510') */
    version: string
    /** Human-readable name (e.g., 'add_user_email') */
    name: string
    /** Previous version this migration applies to (null for initial) */
    from: string | null
    /** Changes per class */
    up: Record<string, MigrationFieldChanges>
}

/**
 * Migration registry for runtime application.
 */
export interface MigrationRegistry {
    /** All registered migrations indexed by version */
    migrations: Map<string, Migration>
    /** Class aliases (old name → new name) */
    aliases: Map<string, string>
    /** Current schema version */
    currentVersion: string | null
    /** Ordered list of versions for chain application */
    versionChain: string[]
}
