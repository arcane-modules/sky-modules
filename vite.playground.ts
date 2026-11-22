import { defineConfig, type PluginOption, type UserConfig } from 'vite'
import { resolve } from 'node:path'

export interface PlaygroundOptions {
    /** Extra Vite plugins, e.g. JSX compilation for `@sky-modules/jsx`. */
    plugins?: PluginOption[]
}

/**
 * Shared Vite config for package playgrounds.
 * Aliases every `@sky-modules/<name>` to `packages/<name>/src`, so edits hot-reload without a build.
 */
export function createPlaygroundConfig(playgroundDir: string, { plugins = [] }: PlaygroundOptions = {}): UserConfig {
    const packagesDir = resolve(import.meta.dirname, 'packages')

    return defineConfig({
        root: playgroundDir,
        plugins,
        resolve: {
            alias: [{ find: /^@sky-modules\/([^/]+)/, replacement: `${packagesDir}/$1/src` }],
        },
    })
}
