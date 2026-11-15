// biome-ignore lint/suspicious/noExplicitAny: constructor arguments of arbitrary context classes
export type ArborContextClass = { new (...args: any[]): any; context: true }

import type ArborBase from './internal/ArborBase'

export type ArborDependency = ArborBase | [ArborBase, ArborContextClass]

export interface ArborEvent {
    isCaptured?: boolean
    [key: string]: unknown
}

export type ArborHandler = (...args: unknown[]) => unknown

export type Destructor = () => void | Promise<void>

/** Setup callback: may return a destructor or nothing. */
// biome-ignore lint/suspicious/noConfusingVoidType: setup callbacks may legitimately return nothing
export type ArborSetup = () => Destructor | void
