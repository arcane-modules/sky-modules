import type { ElementType } from './element-type'

/**
 * @sky-modules/jsx
 *
 * Universal JSX runtime based on SolidJS.
 *
 * Re-exports SolidJS primitives and provides JSX types
 * for cross-framework components.
 *
 * @module
 */

export * from 'solid-js'
export type { ElementType }

// JSX runtime
export { jsx, jsxs } from './jsx-runtime'
export { jsxDEV } from './jsx-dev-runtime'

// Universal renderer primitives
export {
    createElement,
    createTextNode,
    render,
    effect,
    memo,
    insert,
    spread,
    setProp,
    mergeProps,
    createComponent,
} from './jsx-universal'

/**
 * Fragment element type for grouping multiple JSX elements.
 *
 * @global
 */
export const Fragment = 'Fragment'

/**
 * JSX namespace for TypeScript type checking.
 *
 * @global
 */
export namespace JSX {
    /** Function component type. */
    export type FC<P = Record<string, unknown>> = (props: P) => JSX.Element

    /** Text node structure. */
    export interface TextNode {
        type: 'text'
        value: string
    }

    /** JSX element structure. */
    export interface Element {
        type: ElementType
        props: object
        children?: Node
    }

    /** Valid children types in JSX. */
    export type Node = Element | TextNode | Node[] | string | number | boolean | null | undefined

    /** Intrinsic elements (lowercase tags). */
    export interface IntrinsicElements extends Record<string, Record<string, unknown>> {}

    /** Any class can be used as JSX element class. */
    export type ElementClass = object

    /** Props are accessed via 'props' property or constructor argument. */
    export interface ElementAttributesProperty {
        props: Record<string, unknown>
    }

    /** Children prop name. */
    export interface ElementChildrenAttribute {
        children: Record<string, unknown>
    }
}

export default JSX
