import type { Element as SolidElement } from 'solid-js'
import type { JSXNode } from './nodes'

/**
 * Ref callback receiving the created node.
 * Declared as a method so engines may narrow the node type (`(node: SpriteNode) => void`).
 */
export type JSXRef = { bivarianceHack(node: JSXNode): void }['bivarianceHack']

/** Props accepted by any intrinsic tag; engines narrow them via declaration merging. */
export interface IntrinsicProps {
    children?: JSX.Element
    ref?: JSXRef | JSXRef[]
    [name: string]: unknown
}

/** JSX types for `jsxImportSource: "@sky-modules/jsx"` with `jsx: "preserve"`. */
export namespace JSX {
    export type Element = SolidElement | JSXNode | ArrayElement

    export interface ArrayElement extends Array<Element> {}

    export interface ElementChildrenAttribute {
        children: unknown
    }

    export interface IntrinsicElements {
        [tag: string]: IntrinsicProps
    }
}
