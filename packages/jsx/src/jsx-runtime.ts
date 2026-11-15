import type { ElementType } from './element-type'

/**
 * JSX runtime for production builds.
 *
 * Provides the jsx() function used by TypeScript/Babel for JSX transformation
 * in production mode.
 *
 * @module jsx/jsx-runtime
 */

/**
 * Creates a JSX element.
 *
 * Called by the TypeScript/Babel compiler when transforming JSX syntax
 * in production mode.
 *
 * @global
 * @param type - Element type (string for intrinsic elements, function/class for components).
 * @param props - Element properties and attributes.
 * @returns JSX element object.
 *
 * @example
 * ```typescript
 * // JSX: <div className="box">Hello</div>
 * // Transforms to:
 * jsx('div', { className: 'box', children: 'Hello' })
 * ```
 */
export function jsx(type: ElementType, props: Record<string, unknown>): JSX.Element {
    return { type, props }
}

/**
 * Creates a JSX element with static children.
 *
 * Called by the compiler when children are statically known.
 * Same as jsx() for @sky-modules/jsx since static children are not optimized differently.
 *
 * @global
 */
export function jsxs(type: ElementType, props: Record<string, unknown>): JSX.Element {
    return { type, props }
}

/**
 * Fragment element type.
 *
 * @global
 */
export const Fragment = 'Fragment'

/**
 * JSX namespace for type checking.
 *
 * @global
 */
export namespace JSX {
    /** JSX element structure returned by jsx(). */
    export interface Element {
        type: ElementType
        props: object
    }

    /** Valid children types in JSX. */
    export type Node = Element | Element[] | string | number | boolean | null | undefined

    /** Children are passed via `children` prop. */
    export interface ElementChildrenAttribute {
        children: Record<string, unknown>
    }

    /** Any class can be used as JSX element class. */
    export type ElementClass = object

    /** Intrinsic elements (lowercase tags). */
    export interface IntrinsicElements extends Record<string, Record<string, unknown>> {}
}
