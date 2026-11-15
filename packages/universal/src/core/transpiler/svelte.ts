/**
 * Svelte Generator
 *
 * Transpiles Fusion Components to Svelte.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class SvelteGenerator implements Generator {
    readonly framework: Framework = 'svelte'

    /**
     * Generate Svelte code
     */
    generate(
        _componentName: string,
        props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const template = jsxNodes.map((node) => node.raw).join('\n')

        const code = `<script lang="ts">
  interface Props {
${props.map((prop) => `    ${prop}?: any`).join('\n')}
  }

  let { ${props.join(', ')} }: Props = $props()
</script>

${template}
`

        return { code }
    }
}
