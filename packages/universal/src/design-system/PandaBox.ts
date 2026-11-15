/**
 * PandaBox component
 *
 * Box component with Panda CSS (Chakra UI) props integration.
 * Supports Panda CSS design system with theme support.
 *
 * @module
 */

import * as React from 'react'

/**
 * Panda CSS props interface
 *
 * @global
 */
export interface PandaProps {
    /** Background color */
    backgroundColor?: string
    /** Border radius */
    borderRadius?: string
    /** Margin */
    margin?: string
    /** Padding */
    padding?: string
    /** Display mode */
    display?: 'block' | 'flex' | 'inline' | 'inline-flex'
    /** Flex direction */
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    /** Flex gap */
    gap?: string
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right'
    /** Font size */
    fontSize?: string
    /** Font weight */
    fontWeight?: string
    /** Text transform */
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize'
}

/**
 * PandaBox props combining Panda CSS and Box props
 *
 * @global
 * @template T - Element tag or component type (default: 'div')
 */
export interface PandaBoxProps<T extends string = 'div'> {
    as?: T
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
    // Panda CSS props
    p?: string
    px?: string
    py?: string
    pb?: string
    pt?: string
    pc?: string
    pl?: string
    pr?: string
    m?: string
    mx?: string
    my?: string
    ml?: string
    mr?: string
    mt?: string
    mb?: string
    bg?: string
    bgColor?: string
    rounded?: string
    roundedSm?: string
    roundedMd?: string
    roundedLg?: string
    roundedXl?: string
    display?: 'block' | 'flex' | 'inline' | 'inline-flex'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    gap?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
    fontWeight?: string
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize'
}

/**
 * Universal PandaBox component with Panda CSS integration
 *
 * @template T - Element tag or component type (default: 'div')
 *
 * @global
 * @example
 * ```ts
 * import { PandaBox } from '@sky-modules/universal/design-system'
 *
 * const element = PandaBox({ bg: 'primary.500', p: '4', rounded: 'md', children: 'Content' })
 * ```
 */
export function PandaBox<T extends string = 'div'>(props: PandaBoxProps<T>): React.JSX.Element {
    const { as: Component = 'div', children, className, style, ...rest } = props

    return React.createElement(
        Component as string,
        {
            className,
            style,
            ...rest,
        },
        children
    )
}
