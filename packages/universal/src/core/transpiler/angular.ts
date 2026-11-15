/**
 * Angular Generator
 *
 * Transpiles Fusion Components to Angular components.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class AngularGenerator implements Generator {
    readonly framework: Framework = 'angular'

    /**
     * Generate Angular component code
     */
    generate(
        componentName: string,
        props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const selector = componentName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const template = jsxNodes.map((node) => node.raw).join('\n')

        const code = `import { Component, Input } from '@angular/core'

@Component({
  selector: '${selector}',
  standalone: true,
  template: \`
${template}
  \`,
})
export class ${componentName}Component {
${props.map((prop) => `  @Input() ${prop}: any`).join('\n')}
}
`

        return { code, template }
    }
}
