/**
 * Get SlotRoot context hook.
 *
 * @module
 */

import { useSlotRoot, type SlotRootContextType } from './SlotRoot.context'

/**
 * Hook to access SlotRoot context.
 *
 * @global
 * @returns Current SlotRoot context or undefined.
 */
export default function getSlotRoot(): SlotRootContextType | undefined {
    // biome-ignore lint/correctness/useHookAtTopLevel: this helper is meant to be called from components
    return useSlotRoot()
}

export { useSlotRoot }
