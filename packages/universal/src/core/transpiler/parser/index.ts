/**
 * Fusion Components parser
 *
 * Regex-based parser for .x.tsx / .lite.tsx universal components.
 * Extracts component metadata used by framework generators.
 *
 * @module
 */

import type { ParseResult, Framework, TranspileResult } from '../types'

/**
 * Parse a universal component source file.
 *
 * @global
 * @param source - Component source code.
 * @returns Parsed component metadata.
 */
export function parseSource(source: string): ParseResult {
    // Extract default export component name
    const componentNameMatch = source.match(/export\s+default\s+function\s+(\w+)/)
    const componentName = componentNameMatch?.[1] ?? 'Component'

    // Extract props type name
    const propsMatch = source.match(/function\s+\w+\s*\(\s*props\s*:\s*(\w+)/)
    const propsType = propsMatch?.[1] ?? 'unknown'

    // Extract destructured props
    const destructuredMatch = source.match(/const\s*\{\s*([^}]+)\}\s*=\s*props/)
    const destructuredContent = destructuredMatch?.[1]
    const props = destructuredContent
        ? destructuredContent
              .split(',')
              .map((p) => {
                  const name = p.split(/[?:=]/)[0]
                  return name ? name.trim() : ''
              })
              .filter(Boolean)
        : []

    // Extract state declarations (useState / createState / useStore)
    const stateRegex = /const\s+(\w+)\s*=\s*(?:useState|createState|useStore)\s*\(/g
    const stateDeclarations: string[] = []
    for (const stateMatch of source.matchAll(stateRegex)) {
        const name = stateMatch[1]
        if (name) {
            stateDeclarations.push(name)
        }
    }

    // Extract effect declarations
    const effectRegex = /const\s+(\w+)\s*=\s*useEffect\s*\(/g
    const effectDeclarations: string[] = []
    for (const effectMatch of source.matchAll(effectRegex)) {
        const name = effectMatch[1]
        if (name) {
            effectDeclarations.push(name)
        }
    }

    // Extract JSX return body
    const returnMatch = source.match(/return\s*\(([\s\S]*?)\)\s*$/m)
    const jsxBody = returnMatch?.[1] ?? ''

    // Extract top-level JSX nodes (simplified)
    const jsxNodes = jsxBody
        .split('\n')
        .filter((line) => line.trim().startsWith('<'))
        .map((raw) => ({ raw: raw.trim() }))

    return {
        componentName,
        props: props.length > 0 ? props : [propsType],
        stateDeclarations,
        effectDeclarations,
        jsxNodes: jsxNodes.length > 0 ? jsxNodes : [{ raw: jsxBody }],
    }
}

/**
 * Transpile parsed component to a target framework.
 *
 * @global
 * @param source - Component source code.
 * @param framework - Target framework.
 * @param generator - Generator instance for the target framework.
 * @returns Transpiled code result.
 */
export function transpile(
    source: string,
    framework: Framework,
    generator: {
        framework: Framework
        generate(
            componentName: string,
            props: string[],
            stateDeclarations: string[],
            effectDeclarations: string[],
            jsxNodes: Array<{ raw: string }>
        ): TranspileResult
    }
): TranspileResult {
    if (generator.framework !== framework) {
        throw new Error(`Generator framework ${generator.framework} does not match target ${framework}`)
    }

    const parsed = parseSource(source)
    return generator.generate(
        parsed.componentName,
        parsed.props,
        parsed.stateDeclarations,
        parsed.effectDeclarations,
        parsed.jsxNodes
    )
}
