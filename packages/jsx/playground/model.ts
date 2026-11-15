import { createComponent, createElement, createTextNode, insert, jsx, setProp } from '@sky-modules/jsx'
import type { EngineElement } from '@sky-modules/jsx/jsx-universal'

/** Minimal engine node that records everything the universal renderer does to it. */
export class LogNode implements EngineElement {
    readonly log: string[] = []

    constructor(readonly name: string) {}

    setJSXProperty(name: string, value: unknown): void {
        this.log.push(`${this.name}.setJSXProperty(${name}, ${JSON.stringify(value)})`)
    }

    addJSXChild(child: unknown): void {
        this.log.push(`${this.name}.addJSXChild(${JSON.stringify(child)})`)
    }

    removeJSXChild(child: unknown): void {
        this.log.push(`${this.name}.removeJSXChild(${JSON.stringify(child)})`)
    }

    getJSXParent(): EngineElement | null {
        return null
    }

    getJSXFirstChild(): EngineElement | null {
        return null
    }

    getJSXNextSibling(): EngineElement | null {
        return null
    }
}

function Greeting(props: Record<string, unknown>): unknown {
    return jsx('greeting', { text: `Hello, ${String(props.name)}!` })
}

export interface Demo {
    title: string
    output: string
}

export function runDemos(): Demo[] {
    const element = jsx('box', { x: 10, children: 'hi' })

    const engine = new LogNode('engine')
    setProp(engine as never, 'color', 'red')
    insert(engine as never, createElement('sprite') as never)
    insert(engine as never, createTextNode('label') as never)

    const component = createComponent(Greeting, { name: 'Anna' })

    return [
        { title: "jsx('box', { x: 10, children: 'hi' })", output: JSON.stringify(element, null, 2) },
        { title: 'Engine element receives renderer calls', output: engine.log.join('\n') },
        { title: "createComponent(Greeting, { name: 'Anna' })", output: JSON.stringify(component, null, 2) },
    ]
}
