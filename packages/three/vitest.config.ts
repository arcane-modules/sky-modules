import { solidUniversal } from '@sky-modules/jsx/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [solidUniversal()],
    test: {
        globals: true,
        environment: 'node',
    },
})
