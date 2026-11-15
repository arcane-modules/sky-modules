/**
 * Solid Generator
 *
 * Transpiles Fusion Components to SolidJS.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class SolidGenerator implements Generator {
    readonly framework: Framework = 'solid'

    /**
     * Generate SolidJS code
     */
    generate(
        componentName: string,
        _props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const jsx = jsxNodes.map((node) => node.raw).join('\n')

        const code = `import { JSX } from 'solid-js'

export default function ${componentName}(props: any): JSX.Element {
  return (
${jsx}
  )
}
`

        return { code }
    }
}
