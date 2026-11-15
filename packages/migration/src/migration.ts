/**
 * Migration system for @sky-modules/migration.
 *
 * Allows schema evolution with automatic data transformation.
 * Migrations are applied in order when loading data saved with an older version.
 */

import type { Migration, MigrationFieldChanges, MigrationRegistry } from './types'

/**
 * Global migration registry.
 */
const registry: MigrationRegistry = {
    migrations: new Map(),
    aliases: new Map(),
    currentVersion: null,
    versionChain: [],
}

/**
 * @global
 * Gets the current schema version.
 * Returns null if no migrations have been registered.
 *
 * @returns Current schema version or null.
 */
export function getCurrentVersion(): string | null {
    return registry.currentVersion
}

/**
 * @global
 * Sets the current schema version.
 *
 * @param version - Schema version string.
 */
export function setCurrentVersion(version: string): void {
    registry.currentVersion = version
}

/**
 * Registers a single migration.
 *
 * @example
 * ```ts
 * registerMigration({
 *     version: '20241208_125510',
 *     name: 'add_user_email',
 *     from: '20241201_120000',
 *     up: {
 *         'app.User': {
 *             add: { email: '' },
 *         },
 *     },
 * })
 * ```
 */
export function registerMigration(migration: Migration): void {
    registry.migrations.set(migration.version, migration)
    rebuildVersionChain()
}

/**
 * @global
 * Registers multiple migrations at once.
 *
 * @param migrations - Array of migrations to register.
 *
 * @example
 * ```ts
 * import * as migrations from './migrations'
 * registerMigrations(Object.values(migrations))
 * ```
 */
export function registerMigrations(migrations: Migration[]): void {
    for (const migration of migrations) {
        registry.migrations.set(migration.version, migration)
    }

    rebuildVersionChain()
}

/**
 * Registers a class alias for backwards compatibility.
 * When loading data with old class name, it will be resolved to new name.
 *
 * @example
 * ```ts
 * // Class was renamed from app.Player to app.GamePlayer
 * registerAlias('app.Player', 'app.GamePlayer')
 * ```
 */
export function registerAlias(oldName: string, newName: string): void {
    registry.aliases.set(oldName, newName)
}

/**
 * @global
 * Resolves a class name through aliases.
 * Returns the final class name after following alias chain.
 *
 * @param className - Class name to resolve.
 * @returns Resolved class name.
 */
export function resolveClassName(className: string): string {
    let resolved = className
    const visited = new Set<string>()

    while (registry.aliases.has(resolved)) {
        if (visited.has(resolved)) {
            throw new Error(`Circular alias detected: ${className}`)
        }

        visited.add(resolved)
        resolved = registry.aliases.get(resolved)!
    }

    return resolved
}

/**
 * Gets the migration chain from one version to another.
 * Returns ordered array of migrations to apply.
 */
export function getMigrationChain(fromVersion: string | null, toVersion: string | null): Migration[] {
    if (fromVersion === toVersion) return []
    if (toVersion === null) return []

    // No migrations registered — nothing to apply
    if (registry.versionChain.length === 0) return []

    const chain: Migration[] = []
    const fromIndex = fromVersion === null ? -1 : registry.versionChain.indexOf(fromVersion)
    const toIndex = registry.versionChain.indexOf(toVersion)

    // Target version not in migration chain — no migrations to apply
    if (toIndex === -1) return []

    // Forward migration
    if (fromIndex < toIndex) {
        for (let i = fromIndex + 1; i <= toIndex; i++) {
            const version = registry.versionChain[i]
            if (version === undefined) continue
            const migration = registry.migrations.get(version)

            if (migration) {
                chain.push(migration)
            }
        }
    }

    return chain
}

/**
 * @global
 * Applies migrations to data object.
 * Transforms data from old version to new version.
 *
 * @param className - Class name to apply migrations to.
 * @param data - Data object to transform.
 * @param fromVersion - Source version (null for latest).
 * @param toVersion - Target version (null for latest).
 * @returns Transformed data object.
 */
export function applyMigrations(
    className: string,
    data: Record<string, unknown>,
    fromVersion: string | null,
    toVersion: string | null
): Record<string, unknown> {
    const chain = getMigrationChain(fromVersion, toVersion)
    let result = { ...data }

    for (const migration of chain) {
        const changes = migration.up[className]

        if (changes) {
            result = applyFieldChanges(result, changes)
        }
    }

    return result
}

/**
 * Applies field changes to a data object.
 */
function applyFieldChanges(data: Record<string, unknown>, changes: MigrationFieldChanges): Record<string, unknown> {
    let result = { ...data }

    // Apply renames first
    if (changes.rename) {
        for (const [oldName, newName] of Object.entries(changes.rename)) {
            if (oldName in result) {
                result[newName] = result[oldName]
                delete result[oldName]
            }
        }
    }

    // Apply removals
    if (changes.remove) {
        for (const field of changes.remove) {
            delete result[field]
        }
    }

    // Apply additions with defaults
    if (changes.add) {
        for (const [field, defaultValue] of Object.entries(changes.add)) {
            if (!(field in result)) {
                result[field] = defaultValue
            }
        }
    }

    // Apply custom transform
    if (changes.transform) {
        result = changes.transform(result)
    }

    return result
}

/**
 * Rebuilds the version chain from registered migrations.
 * Sorts versions chronologically.
 */
function rebuildVersionChain(): void {
    const versions = Array.from(registry.migrations.keys())
    // Sort by timestamp (versions are like '20241208_125510')
    versions.sort((a, b) => a.localeCompare(b))
    registry.versionChain = versions

    // Update current version to latest
    if (versions.length > 0) {
        const latest = versions[versions.length - 1]
        if (latest !== undefined) {
            registry.currentVersion = latest
        }
    }
}

/**
 * @global
 * Generates a timestamp-based version string.
 *
 * @returns Timestamp string in format YYYYMMDD_HHMMSS.
 */
export function generateVersionTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

/**
 * @global
 * Clears all registered migrations (useful for testing).
 */
export function clearMigrations(): void {
    registry.migrations.clear()
    registry.aliases.clear()
    registry.currentVersion = null
    registry.versionChain = []
}

/**
 * @global
 * Gets the migration registry (for debugging/testing).
 *
 * @returns Migration registry object.
 */
export function getMigrationRegistry(): Readonly<MigrationRegistry> {
    return registry
}
