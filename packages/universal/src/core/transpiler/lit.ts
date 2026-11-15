/**
 * Lit Generator
 *
 * Transpiles Fusion Components to Lit elements.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class LitGenerator implements Generator {
    readonly framework: Framework = 'lit'

    /**
     * Generate Lit element code
     */
    generate(
        componentName: string,
        props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const tag = componentName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const template = jsxNodes.map((node) => node.raw).join('\n')

        const code = `import { LitElement, html, css } from 'lit'
import { property } from 'lit/decorators.js'

export class ${componentName}Element extends LitElement {
${props.map((prop) => `  @property({ attribute: '${prop}' })\n  ${prop}: any`).join('\n')}

  render() {
    return html\`
${template}
    \`
  }

  static styles = css\`
    :host { display: block; }
  \`
}

customElements.define('${tag}', ${componentName}Element)
`

        return { code }
    }
}
