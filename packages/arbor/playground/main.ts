import { ArborNode, ArborTree } from '@sky-modules/arbor'

function requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id)
    if (!element) throw new Error(`Missing element #${id}`)
    return element as T
}

const logElement = requireElement<HTMLPreElement>('log')

function log(message: string): void {
    logElement.textContent += `${message}\n`
}

const tree = new ArborTree()
const nodes: ArborNode[] = []

requireElement<HTMLButtonElement>('add').addEventListener('click', () => {
    const index = nodes.length + 1
    const parent = nodes.at(-1) ?? tree

    const node = new ArborNode(() => {
        log(`setup node ${index}`)
        return () => log(`destroy node ${index}`)
    }, parent)

    tree.commit()
    nodes.push(node)
})

requireElement<HTMLButtonElement>('dispose').addEventListener('click', async () => {
    const node = nodes.pop()
    if (!node) return log('nothing to dispose')
    await node.dispose()
})

requireElement<HTMLButtonElement>('clear').addEventListener('click', () => {
    logElement.textContent = ''
})
