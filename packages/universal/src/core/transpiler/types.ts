/**
 * Transpiler types
 */

export type Framework = 'react' | 'solid' | 'vue' | 'svelte' | 'qwik' | 'angular' | 'lit'

export interface TranspileResult {
    code: string
    template?: string // For Angular
}

export interface ParseResult {
    componentName: string
    props: string[]
    stateDeclarations: string[]
    effectDeclarations: string[]
    jsxNodes: Array<{ raw: string }>
}

export interface Generator {
    framework: Framework
    generate(
        componentName: string,
        props: string[],
        stateDeclarations: string[],
        effectDeclarations: string[],
        jsxNodes: Array<{ raw: string }>
    ): TranspileResult
}
