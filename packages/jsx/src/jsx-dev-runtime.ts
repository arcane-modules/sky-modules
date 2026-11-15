import type { ElementType } from './element-type'

/**
 * JSX runtime for development builds.
 *
 * Provides the jsxDEV() function used by TypeScript/Babel for JSX transformation
 * in development mode.
 *
 * @module jsx/jsx-dev-runtime
 */

/**
 * Creates a JSX element (development version).
 *
 * Called by the TypeScript/Babel compiler when transforming JSX syntax
 * in development mode. Identical to jsx() but can include additional
 * debugging information in the future.
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
 * jsxDEV('div', { className: 'box', children: 'Hello' })
 * ```
 */
export function jsxDEV(type: ElementType, props: Record<string, unknown>): JSX.Element {
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
    /** JSX element structure returned by jsxDEV(). */
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
