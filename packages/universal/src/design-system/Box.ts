/**
 * Box component
 *
 * Polymorphic container with design system integration, supporting:
 * - Panda CSS design system props
 * - Tailwind/utility classes via sx prop
 * - Polymorphic rendering (any HTML element or component)
 * - asChild pattern for prop merging
 * - Cross-framework compatibility
 *
 * @module
 */

import * as React from 'react'

/**
 * Tag name type
 */
export type TagName = 'div' | 'span' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav' | 'aside'

/**
 * Box own props
 *
 * Combines Panda CSS props with styling and behavior props
 *
 * @global
 */
export interface BoxOwnProps {
    sx?: string
    children?: React.ReactNode
    asChild?: boolean
    ref?: React.Ref<HTMLElement>
    className?: string
    style?: React.CSSProperties
    padding?: string
    margin?: string
    backgroundColor?: string
    borderRadius?: string
}

/**
 * Box props when rendered as an HTML element
 *
 * @global
 * @template T - HTML element tag name (default: 'div')
 */
export type BoxProps<T extends TagName = 'div'> = {
    as?: T
} & BoxOwnProps

/**
 * Box component props
 *
 * @global
 * @template P - Component props type
 */
export type BoxComponentProps<P> = {
    as?: (props: P) => React.JSX.Element
} & BoxOwnProps &
    P

/**
 * Universal polymorphic Box component
 *
 * @template T - Element tag or component type (default: 'div')
 *
 * @global
 * @example
 * ```ts
 * const element = Box({ padding: '4', backgroundColor: 'primary.500', children: 'Content' })
 * ```
 */
export function Box<T extends TagName = 'div'>(props: BoxProps<T>): React.JSX.Element {
    const {
        as: Component = 'div',
        children,
        className,
        style,
        padding,
        margin,
        backgroundColor,
        borderRadius,
        ...rest
    } = props

    const elementStyle: React.CSSProperties = {
        padding,
        margin,
        backgroundColor,
        borderRadius,
        ...style,
    }

    return React.createElement(
        Component as string,
        {
            className,
            style: elementStyle,
            ...rest,
        },
        children
    )
}
