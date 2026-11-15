/**
 * Vue Generator
 *
 * Transpiles Fusion Components to Vue SFC.
 */

import type { Framework, TranspileResult, Generator } from './types'

export class VueGenerator implements Generator {
    readonly framework: Framework = 'vue'

    /**
     * Generate Vue SFC code
     */
    generate(
        _componentName: string,
        props: string[],
        _stateDeclarations: string[],
        _effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult {
        const template = jsxNodes.map((node) => node.raw).join('\n')

        const code = `<script setup lang="ts">
const props = defineProps<{
${props.map((prop) => `  ${prop}: any`).join('\n')}
}>()
</script>

<template>
${template}
</template>
`

        return { code }
    }
}
