import { createRenderer } from '@solidjs/universal'
import { getOwner, onCleanup } from 'solid-js'
import type { JSX } from './jsx-runtime'
import { createNode, type JSXNode, JSXTextNode } from './nodes'

const parents = new WeakMap<JSXNode, JSXNode>()

function detach(node: JSXNode): void {
    const parent = parents.get(node)
    if (parent === undefined) return
    parent.removeJSXChild(node)
    parents.delete(node)
}

const renderer = createRenderer<JSXNode>({
    createElement(tag: string, staticProps?: Record<string, unknown>): JSXNode {
        const node = createNode(tag)
        if (staticProps !== undefined) {
            for (const [name, value] of Object.entries(staticProps)) node.setJSXProperty(name, value, undefined)
        }
        // Tie engine resources to the owner that created the node
        if (node.disposeJSX !== undefined && getOwner() !== null) onCleanup(() => node.disposeJSX?.())
        return node
    },

    createTextNode(value: string): JSXNode {
        return new JSXTextNode(String(value))
    },

    replaceText(node: JSXNode, value: string): void {
        if (node instanceof JSXTextNode) node.value = String(value)
    },

    isTextNode(node: JSXNode): boolean {
        return node instanceof JSXTextNode
    },

    setProperty<T>(node: JSXNode, name: string, value: T, prev?: T): void {
        node.setJSXProperty(name, value, prev)
    },

    insertNode(parent: JSXNode, node: JSXNode, anchor?: JSXNode): void {
        if (node === anchor) return
        // Moving semantics as in DOM insertBefore: detach from the previous position first
        detach(node)
        parent.insertJSXChild(node, anchor)
        parents.set(node, parent)
    },

    removeNode(parent: JSXNode, node: JSXNode): void {
        parent.removeJSXChild(node)
        parents.delete(node)
    },

    getParentNode(node: JSXNode): JSXNode | undefined {
        return parents.get(node)
    },

    getFirstChild(node: JSXNode): JSXNode | undefined {
        return node.getJSXChildren()[0]
    },

    getNextSibling(node: JSXNode): JSXNode | undefined {
        const parent = parents.get(node)
        if (parent === undefined) return undefined
        const siblings = parent.getJSXChildren()
        return siblings[siblings.indexOf(node) + 1]
    },
})

/**
 * Mounts a JSX tree into `root` and returns the dispose function.
 * Accepts any JSX value (nodes, text, arrays, components), as `insert` does at runtime.
 */
export function render(code: () => JSX.Element, root: JSXNode): () => void {
    return renderer.render(code as () => JSXNode, root)
}

// Compiled universal JSX imports these from `@sky-modules/jsx`
export const {
    effect,
    memo,
    createComponent,
    createElement,
    createTextNode,
    insertNode,
    insert,
    spread,
    setProp,
    mergeProps,
    applyRef,
    ref,
} = renderer
