/**
 * @sky-modules/jsx — Solid 2 universal renderer for any scene graph.
 *
 * JSX is compiled by `@solidjs/compiler` (see `@sky-modules/jsx/vite`) into calls
 * of the renderer functions exported here.
 *
 * @module
 */

export * from 'solid-js'

export type { IntrinsicProps, JSX, JSXRef } from './jsx-runtime'
export { createNode, defineElement, type JSXElementFactory, JSXElementNode, type JSXNode, JSXTextNode } from './nodes'
// Explicit exports take precedence over same-named `solid-js` star exports
export {
    applyRef,
    createComponent,
    createElement,
    createTextNode,
    effect,
    insert,
    insertNode,
    memo,
    mergeProps,
    ref,
    render,
    setProp,
    spread,
} from './renderer'
