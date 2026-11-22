import { createSignal, For, JSXElementNode, type JSXNode, JSXTextNode, render, Show } from '@sky-modules/jsx'

const INDENT = '  '

/** Renders a node tree as indented text. */
export function dump(node: JSXNode, depth = 0): string {
    const indent = INDENT.repeat(depth)

    if (node instanceof JSXTextNode) return `${indent}"${node.value}"`
    if (!(node instanceof JSXElementNode)) return `${indent}<engine node>`

    const props = Object.entries(node.props)
        .map(([name, value]) => ` ${name}=${JSON.stringify(value)}`)
        .join('')
    const children = node.children.map((child) => dump(child, depth + 1))

    return [`${indent}<${node.tag}${props}>`, ...children].join('\n')
}

export interface CounterDemo {
    readonly root: JSXElementNode
    increment(): void
    dispose(): void
}

/** Reactive counter: a prop, a conditional child and a list driven by one signal. */
export function createCounterDemo(): CounterDemo {
    const [count, setCount] = createSignal(0)
    const root = new JSXElementNode('root')

    const dispose = render(
        () => (
            <counter value={count()}>
                <Show when={count() % 2 === 0}>
                    <badge kind="even" />
                </Show>
                <For each={Array.from({ length: count() }, (_, index) => index)}>
                    {(index) => <dot index={index} />}
                </For>
            </counter>
        ),
        root
    )

    return {
        root,
        increment: () => setCount((value) => value + 1),
        dispose,
    }
}
