/**
 * SlotRootProvider component
 *
 * Provider for passing styles and controller to children via SolidJS context.
 *
 * @module
 */

import type { JSX } from 'solid-js'

import { SlotRootContext, type SlotRootContextType } from './SlotRoot.context'

/**
 * Props for SlotRootProvider component.
 *
 * @global
 */
export interface SlotRootProviderProps {
    /** Child components. */
    children?: JSX.Element
    /** Styles to apply to slotted children. */
    styles?: SlotRootContextType['styles']
    /** Controller for managing slot state. */
    controller?: SlotRootContextType['controller']
}

/**
 * SlotRoot provider for passing styles and controller to children.
 *
 * @global
 * @example
 * ```tsx
 * <SlotRootProvider styles={{ trigger: 'px-4 py-2' }} controller={controller}>
 *   {children}
 * </SlotRootProvider>
 * ```
 */
export default function SlotRootProvider(props: SlotRootProviderProps): JSX.Element {
    const value: SlotRootContextType = {
        get styles() {
            return props.styles
        },
        get controller() {
            return props.controller
        },
    }

    return <SlotRootContext.Provider value={value}>{props.children}</SlotRootContext.Provider>
}
