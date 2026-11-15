/**
 * Tests for @sky-modules/migration — schema versioning and migration.
 */

import { describe, expect, test, beforeEach } from 'vitest'
import {
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
} from './index'

describe('migration', () => {
    beforeEach(() => {
        clearMigrations()
    })

    // ─── registerMigration ───────────────────────────────────────

    describe('registerMigration', () => {
        test('registers a single migration', () => {
            registerMigration({
                version: '20241201_120000',
                name: 'initial',
                from: null,
                up: {},
            })

            const registry = getMigrationRegistry()
            expect(registry.migrations.has('20241201_120000')).toBe(true)
            expect(registry.currentVersion).toBe('20241201_120000')
        })

        test('updates current version to latest', () => {
            registerMigration({
                version: '20241201_120000',
                name: 'v1',
                from: null,
                up: {},
            })

            registerMigration({
                version: '20241208_125510',
                name: 'v2',
                from: '20241201_120000',
                up: {},
            })

            expect(getCurrentVersion()).toBe('20241208_125510')
        })
    })

    // ─── registerMigrations ──────────────────────────────────────

    describe('registerMigrations', () => {
        test('registers multiple migrations', () => {
            registerMigrations([
                {
                    version: '20241201_120000',
                    name: 'v1',
                    from: null,
                    up: {},
                },
                {
                    version: '20241208_125510',
                    name: 'v2',
                    from: '20241201_120000',
                    up: {},
                },
            ])

            const registry = getMigrationRegistry()
            expect(registry.migrations.size).toBe(2)
            expect(getCurrentVersion()).toBe('20241208_125510')
        })
    })

    // ─── getCurrentVersion / setCurrentVersion ────────────────────

    describe('getCurrentVersion / setCurrentVersion', () => {
        test('returns null when no migrations registered', () => {
            expect(getCurrentVersion()).toBeNull()
        })

        test('setCurrentVersion overrides version', () => {
            setCurrentVersion('20241201_120000')
            expect(getCurrentVersion()).toBe('20241201_120000')
        })
    })

    // ─── getMigrationChain ────────────────────────────────────────

    describe('getMigrationChain', () => {
        test('returns empty chain when versions match', () => {
            const chain = getMigrationChain('20241201_120000', '20241201_120000')
            expect(chain).toEqual([])
        })

        test('returns empty chain when no migrations registered', () => {
            const chain = getMigrationChain(null, '20241201_120000')
            expect(chain).toEqual([])
        })

        test('returns ordered chain for forward migration', () => {
            registerMigrations([
                {
                    version: '20241201_120000',
                    name: 'v1',
                    from: null,
                    up: {},
                },
                {
                    version: '20241208_125510',
                    name: 'v2',
                    from: '20241201_120000',
                    up: {},
                },
                {
                    version: '20241215_000000',
                    name: 'v3',
                    from: '20241208_125510',
                    up: {},
                },
            ])

            const chain = getMigrationChain('20241201_120000', '20241215_000000')
            expect(chain).toHaveLength(2)
            expect(chain[0]!.version).toBe('20241208_125510')
            expect(chain[1]!.version).toBe('20241215_000000')
        })

        test('returns chain from null (initial) to latest', () => {
            registerMigrations([
                {
                    version: '20241201_120000',
                    name: 'v1',
                    from: null,
                    up: {},
                },
                {
                    version: '20241208_125510',
                    name: 'v2',
                    from: '20241201_120000',
                    up: {},
                },
            ])

            const chain = getMigrationChain(null, '20241208_125510')
            expect(chain).toHaveLength(2)
        })
    })

    // ─── applyMigrations ─────────────────────────────────────────

    describe('applyMigrations', () => {
        test('adds fields with defaults', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'add_email',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        add: { email: '' },
                    },
                },
            })

            const result = applyMigrations('app.User', { name: 'Anna' }, '20241201_120000', '20241208_125510')

            expect(result).toEqual({ name: 'Anna', email: '' })
        })

        test('does not overwrite existing fields on add', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'add_email',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        add: { email: '' },
                    },
                },
            })

            const result = applyMigrations(
                'app.User',
                { name: 'Anna', email: 'existing@test.com' },
                '20241201_120000',
                '20241208_125510'
            )

            expect(result.email).toBe('existing@test.com')
        })

        test('removes fields', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'remove_age',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        remove: ['age'],
                    },
                },
            })

            const result = applyMigrations('app.User', { name: 'Anna', age: 25 }, '20241201_120000', '20241208_125510')

            expect(result).toEqual({ name: 'Anna' })
        })

        test('renames fields', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'rename_username',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        rename: { username: 'name' },
                    },
                },
            })

            const result = applyMigrations('app.User', { username: 'Anna' }, '20241201_120000', '20241208_125510')

            expect(result).toEqual({ name: 'Anna' })
        })

        test('applies custom transform', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'transform_fullname',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        transform: (data) => ({
                            ...data,
                            fullName: `${data.firstName} ${data.lastName}`,
                        }),
                    },
                },
            })

            const result = applyMigrations(
                'app.User',
                { firstName: 'Anna', lastName: 'Keller' },
                '20241201_120000',
                '20241208_125510'
            )

            expect(result.fullName).toBe('Anna Keller')
        })

        test('applies multiple migrations in order', () => {
            registerMigrations([
                {
                    version: '20241201_120000',
                    name: 'initial',
                    from: null,
                    up: {},
                },
                {
                    version: '20241208_125510',
                    name: 'add_email',
                    from: '20241201_120000',
                    up: {
                        'app.User': {
                            add: { email: '' },
                        },
                    },
                },
                {
                    version: '20241215_000000',
                    name: 'add_age',
                    from: '20241208_125510',
                    up: {
                        'app.User': {
                            add: { age: 0 },
                        },
                    },
                },
            ])

            const result = applyMigrations('app.User', { name: 'Anna' }, '20241201_120000', '20241215_000000')

            expect(result).toEqual({ name: 'Anna', email: '', age: 0 })
        })

        test('only applies migrations for the specified class', () => {
            registerMigration({
                version: '20241208_125510',
                name: 'add_fields',
                from: '20241201_120000',
                up: {
                    'app.User': {
                        add: { email: '' },
                    },
                    'app.Admin': {
                        add: { role: 'admin' },
                    },
                },
            })

            const result = applyMigrations('app.User', { name: 'Anna' }, '20241201_120000', '20241208_125510')

            expect(result).toEqual({ name: 'Anna', email: '' })
            // app.Admin changes not applied
            expect('role' in result).toBe(false)
        })
    })

    // ─── registerAlias / resolveClassName ─────────────────────────

    describe('registerAlias / resolveClassName', () => {
        test('resolves class name through alias', () => {
            registerAlias('app.Player', 'app.GamePlayer')
            expect(resolveClassName('app.Player')).toBe('app.GamePlayer')
        })

        test('resolves through alias chain', () => {
            registerAlias('app.Player', 'app.GamePlayer')
            registerAlias('app.GamePlayer', 'app.Character')
            expect(resolveClassName('app.Player')).toBe('app.Character')
        })

        test('returns original name if no alias', () => {
            expect(resolveClassName('app.User')).toBe('app.User')
        })

        test('throws on circular alias', () => {
            registerAlias('app.A', 'app.B')
            registerAlias('app.B', 'app.A')
            expect(() => resolveClassName('app.A')).toThrow('Circular alias')
        })
    })

    // ─── generateVersionTimestamp ─────────────────────────────────

    describe('generateVersionTimestamp', () => {
        test('generates a timestamp string', () => {
            const timestamp = generateVersionTimestamp()
            expect(timestamp).toMatch(/^\d{8}_\d{6}$/)
        })
    })

    // ─── clearMigrations ──────────────────────────────────────────

    describe('clearMigrations', () => {
        test('clears all migrations', () => {
            registerMigration({
                version: '20241201_120000',
                name: 'v1',
                from: null,
                up: {},
            })

            clearMigrations()

            const registry = getMigrationRegistry()
            expect(registry.migrations.size).toBe(0)
            expect(registry.currentVersion).toBeNull()
            expect(registry.versionChain).toEqual([])
        })
    })
})
