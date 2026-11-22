import { transform } from '@solidjs/compiler'
import { defaultClientConditions, defaultServerConditions, type Plugin } from 'vite'

const MODULE_NAME = '@sky-modules/jsx'
const DEFAULT_INCLUDE = /\.[jt]sx$/
const DEFAULT_EXCLUDE = /[\\/]node_modules[\\/]/
// solid-js resolves to its non-reactive server build under the "node" condition
const BROWSER_CONDITION = 'browser'

export interface SolidUniversalOptions {
    /** Files to compile, matched against the module id without query. */
    include?: RegExp
    exclude?: RegExp
}

/** Compiles JSX with `@solidjs/compiler` in universal mode targeting `@sky-modules/jsx`. */
export function solidUniversal({
    include = DEFAULT_INCLUDE,
    exclude = DEFAULT_EXCLUDE,
}: SolidUniversalOptions = {}): Plugin {
    return {
        name: 'sky-modules:solid-universal',
        enforce: 'pre',

        config() {
            return {
                resolve: { conditions: [BROWSER_CONDITION, ...defaultClientConditions] },
                ssr: {
                    resolve: {
                        conditions: [BROWSER_CONDITION, ...defaultServerConditions],
                        externalConditions: [BROWSER_CONDITION],
                    },
                },
            }
        },

        transform(code, id) {
            const [filename = id] = id.split('?')
            if (!include.test(filename) || exclude.test(filename)) return null

            const result = transform(code, {
                filename,
                generate: 'universal',
                moduleName: MODULE_NAME,
                sourceMap: true,
            })

            return { code: result.code, map: result.map ?? null }
        },
    }
}
