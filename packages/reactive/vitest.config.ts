import { defaultClientConditions, defaultServerConditions } from 'vite'
import { defineConfig } from 'vitest/config'

// solid-js resolves to its non-reactive server build under the "node" condition;
// tests must run against the client build that applications use
const BROWSER_CONDITION = 'browser'

export default defineConfig({
    resolve: { conditions: [BROWSER_CONDITION, ...defaultClientConditions] },
    ssr: {
        resolve: {
            conditions: [BROWSER_CONDITION, ...defaultServerConditions],
            externalConditions: [BROWSER_CONDITION],
        },
    },
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'node',
        globals: true,
    },
})
