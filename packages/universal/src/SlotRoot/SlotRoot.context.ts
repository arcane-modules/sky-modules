/**
 * SlotRoot context
 *
 * Provides slot styles and controller through SolidJS context API.
 * Used by polymorphic and compound components.
 *
 * @module
 */

import { createContext, useContext } from 'solid-js'

/**
 * Slot styles - object mapping slot names to CSS class strings.
 *
 * @global
 */
export type SlotRootStyles = Record<string, string>

/**
 * Controller for compound component state/behavior.
 *
 * @global
 */
export type SlotRootController = unknown

/**
 * Context value passed through SlotRootProvider.
 *
 * @global
 */
export interface SlotRootContextType {
    /** CSS classes for each slot. */
    styles?: SlotRootStyles
    /** Controller with state machine API. */
    controller?: SlotRootController
}

/**
 * SolidJS context for SlotRoot.
 *
 * @global
 */
export const SlotRootContext = createContext<SlotRootContextType | undefined>(undefined)

/**
 * Hook to access SlotRoot context.
 *
 * @global
 * @returns Current SlotRoot context or undefined.
 */
export function useSlotRoot(): SlotRootContextType | undefined {
    return useContext(SlotRootContext)
}

/**
 * Get styles for a specific slot from context.
 *
 * @global
 * @param styles - Slot styles from context.
 * @param slot - Slot name to get styles for.
 * @returns CSS classes for the slot, or empty string if not found.
 */
export function getSlotStyles(styles: SlotRootStyles | undefined, slot: string): string {
    return styles?.[slot] ?? ''
}
