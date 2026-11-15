/**
 * @sky-modules/universal/behavior/machines/robot3
 *
 * robot3 state machine utilities.
 *
 * Provides state machine primitives for UI component state management.
 *
 * @module
 */

export {
    createMachine,
    state,
    transition,
    invoke,
    immediate,
    guard,
    reduce,
    action,
    interpret,
} from 'robot3'

export type { Machine, MachineStates, Service, GetTransitionsFromStates } from 'robot3'
