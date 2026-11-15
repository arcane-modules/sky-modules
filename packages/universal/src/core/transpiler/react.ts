/**
 * React Generator
 *
 * Transpiles Fusion Components to React.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class ReactGenerator implements Generator {
    readonly framework: Framework = 'react'

    /**
     * Generate React code
     */
    generate(
        componentName: string,
        _props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const jsx = jsxNodes.map((node) => node.raw).join('\n')

        const code = `'use client'
import * as React from 'react'

export default function ${componentName}(props: any) {
  return (
${jsx}
  )
}
`

        return { code }
    }
}
