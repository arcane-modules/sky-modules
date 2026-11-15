import type { ElementType } from './element-type'

/**
 * Universal JSX renderer based on SolidJS.
 *
 * Creates a custom SolidJS renderer that handles:
 * - Function components → calls directly
 * - String types (lowercase elements) → creates {type, props} objects
 *
 * @module jsx/jsx-universal
 */

import { createRenderer, type Renderer } from 'solid-js/universal'

/** Interface for engine elements that support JSX props/children. */
export interface EngineElement {
    setJSXProperty(name: string, value: unknown): void
    addJSXChild(child: unknown): void
    removeJSXChild(child: unknown): void
    getJSXParent(): EngineElement | null
    getJSXFirstChild(): EngineElement | null
    getJSXNextSibling(): EngineElement | null
}

/** Node types the renderer works with. */
type RendererNode = EngineElement | JSX.Element | JSX.TextNode | null

/** JSX namespace for this module. */
export namespace JSX {
    /** JSX element structure. */
    export interface Element {
        type: ElementType
        props: object
        children?: Node
    }

    /** Text node structure. */
    export interface TextNode {
        type: 'text'
        value: string
    }

    /** Valid children types. */
    export type Node = Element | TextNode | Node[] | string | number | boolean | null | undefined

    /** Intrinsic elements (lowercase tags). */
    export interface IntrinsicElements extends Record<string, Record<string, unknown>> {}
}

/** Type guard for EngineElement interface. */
function isEngineElement(node: unknown): node is EngineElement {
    if (node === null || typeof node !== 'object') return false
    const el = node as EngineElement
    return (
        typeof el.setJSXProperty === 'function' &&
        typeof el.addJSXChild === 'function' &&
        typeof el.removeJSXChild === 'function' &&
        typeof el.getJSXParent === 'function' &&
        typeof el.getJSXFirstChild === 'function' &&
        typeof el.getJSXNextSibling === 'function'
    )
}

/** Type guard for TextNode. */
function isTextNode(node: RendererNode): node is JSX.TextNode {
    return node !== null && typeof node === 'object' && (node as JSX.TextNode).type === 'text'
}

/** Type guard for JSX Element object. */
function isJSXElement(node: RendererNode): node is JSX.Element {
    return (
        node !== null &&
        typeof node === 'object' &&
        typeof (node as JSX.Element).type !== 'undefined' &&
        typeof (node as JSX.Element).props !== 'undefined' &&
        (node as JSX.TextNode).type !== 'text'
    )
}

type UniversalRenderer = Renderer<RendererNode>

const _renderer = createRenderer<RendererNode>({
    createElement(type: ElementType): RendererNode {
        return { type, props: {} }
    },

    createTextNode(value: string): JSX.TextNode {
        return { type: 'text', value }
    },

    replaceText(textNode: RendererNode, value: string): void {
        if (isTextNode(textNode)) {
            textNode.value = value
        }
    },

    setProperty(node: RendererNode, name: string, value: unknown): void {
        if (!node) return

        if (isEngineElement(node)) {
            node.setJSXProperty(name, value)
            return
        }

        if (isJSXElement(node)) {
            ;(node.props as Record<string, unknown>)[name] = value
        }
    },

    insertNode(parent: RendererNode, node: RendererNode, _anchor: RendererNode): void {
        if (!parent || !node) return

        if (isEngineElement(parent)) {
            parent.addJSXChild(node)
            return
        }

        if (isJSXElement(parent)) {
            const props = parent.props as { children?: JSX.Node }

            if (!props.children) {
                props.children = [node as JSX.Node]
            } else if (Array.isArray(props.children)) {
                props.children.push(node as JSX.Node)
            } else {
                props.children = [props.children, node as JSX.Node]
            }
        }
    },

    isTextNode(node: RendererNode): boolean {
        return isTextNode(node)
    },

    removeNode(parent: RendererNode, node: RendererNode): void {
        if (!parent || !node) return

        if (isEngineElement(parent)) {
            parent.removeJSXChild(node)
            return
        }

        if (isJSXElement(parent)) {
            const props = parent.props as { children?: JSX.Node }

            if (Array.isArray(props.children)) {
                const index = props.children.indexOf(node as JSX.Node)
                if (index !== -1) {
                    props.children.splice(index, 1)
                }
            }
        }
    },

    getParentNode(node: RendererNode): RendererNode {
        if (!node) return null
        if (isEngineElement(node)) return node.getJSXParent()
        return null
    },

    getFirstChild(node: RendererNode): RendererNode {
        if (!node) return null

        if (isEngineElement(node)) return node.getJSXFirstChild()

        if (isJSXElement(node)) {
            const props = node.props as { children?: JSX.Node }
            if (Array.isArray(props.children)) return (props.children[0] as RendererNode) ?? null
            return (props.children as RendererNode) ?? null
        }

        return null
    },

    getNextSibling(node: RendererNode): RendererNode {
        if (!node) return null
        if (isEngineElement(node)) return node.getJSXNextSibling()
        return null
    },
})

/** Renders JSX tree to a container node. */
export const render: UniversalRenderer['render'] = _renderer.render

/** Creates a reactive effect. */
export const effect: UniversalRenderer['effect'] = _renderer.effect

/** Creates a memoized computation. */
export const memo: UniversalRenderer['memo'] = _renderer.memo

/** Creates a DOM element from tag name. */
export const createElement: UniversalRenderer['createElement'] = _renderer.createElement

/** Creates a text node. */
export const createTextNode: UniversalRenderer['createTextNode'] = _renderer.createTextNode

/** Inserts content with reactivity support. */
export const insert: UniversalRenderer['insert'] = _renderer.insert

/** Spreads props onto a node. */
export const spread: UniversalRenderer['spread'] = _renderer.spread

/** Sets a single property on a node. */
export const setProp: UniversalRenderer['setProp'] = _renderer.setProp

/** Merges multiple props objects. */
export const mergeProps: UniversalRenderer['mergeProps'] = _renderer.mergeProps

/**
 * Creates a component instance.
 *
 * Handles function components by calling them directly.
 *
 * @global
 */
export function createComponent(component: unknown, props: Record<string, unknown> | null): RendererNode {
    const safeProps = props ?? {}

    if (typeof component === 'function') {
        return (component as (props: Record<string, unknown>) => RendererNode)(safeProps)
    }

    return null
}
