import { defineConfig, type UserConfig } from 'vite'
import { resolve } from 'node:path'

/**
 * Shared Vite config for package playgrounds.
 * Aliases every `@sky-modules/<name>` to `packages/<name>/src`, so edits hot-reload without a build.
 */
export function createPlaygroundConfig(playgroundDir: string): UserConfig {
    const packagesDir = resolve(import.meta.dirname, 'packages')

    return defineConfig({
        root: playgroundDir,
        resolve: {
            alias: [{ find: /^@sky-modules\/([^/]+)/, replacement: `${packagesDir}/$1/src` }],
        },
    })
}
