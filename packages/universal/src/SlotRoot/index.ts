/**
 * @sky-modules/universal/SlotRoot
 *
 * SlotRoot provider for passing styles and controller to children.
 *
 * @module
 */

export { default as SlotRootProvider } from './SlotRootProvider'
export type { SlotRootProviderProps } from './SlotRootProvider'

export {
    SlotRootContext,
    useSlotRoot,
    getSlotStyles,
    type SlotRootStyles,
    type SlotRootController,
    type SlotRootContextType,
} from './SlotRoot.context'

export { default as getSlotRoot } from './getSlotRoot'
