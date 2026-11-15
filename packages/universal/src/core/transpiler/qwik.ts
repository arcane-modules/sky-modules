/**
 * Qwik Generator
 *
 * Transpiles Fusion Components to Qwik components.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class QwikGenerator implements Generator {
    readonly framework: Framework = 'qwik'

    /**
     * Generate Qwik component code
     */
    generate(
        _componentName: string,
        props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const jsx = jsxNodes.map((node) => node.raw).join('\n')

        const code = `import { component$ } from '@builder.io/qwik'

export default component$((props: {
${props.map((prop) => `  ${prop}?: any`).join('\n')}
}) => {
  return (
${jsx}
  )
})
`

        return { code }
    }
}
