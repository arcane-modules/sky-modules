import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { solidUniversal } from './src/vite'

export default defineConfig({
    plugins: [solidUniversal()],
    resolve: {
        // Compiled JSX imports the renderer by package name; point it at the sources
        alias: [
            { find: /^@sky-modules\/jsx$/, replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
        ],
    },
    test: {
        globals: true,
        environment: 'node',
    },
})
