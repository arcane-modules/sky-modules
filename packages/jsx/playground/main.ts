import { flush } from '@sky-modules/jsx'
import { createCounterDemo, dump } from './model'

function requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id)
    if (!element) throw new Error(`Missing element #${id}`)
    return element as T
}

const output = requireElement<HTMLPreElement>('tree')
const demo = createCounterDemo()

function show(): void {
    flush()
    output.textContent = demo.root.children.map((child) => dump(child)).join('\n')
}

requireElement<HTMLButtonElement>('increment').addEventListener('click', () => {
    demo.increment()
    show()
})

show()
