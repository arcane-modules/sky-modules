/**
 * Types for the define system.
 */

import { idSymbol, typeSymbol, nameSymbol, uidSymbol, listenersOfSharedSymbol } from './symbols'

/**
 * Property access modifiers for network synchronization.
 */
export enum Modifier {
    READ = 'read',
    WRITE = 'write',
    SECRET = 'secret',
}

/**
 * Schema property metadata storing type and modifier.
 */
export interface PropertyMeta {
    type: unknown
    modifier: Modifier
}

/**
 * Static class constructor with define metadata.
 */
export interface Static {
    new (...args: Array<unknown>): object
    prototype: { schema?: Record<string, PropertyMeta> }
    name: string
    [idSymbol]: number
    [typeSymbol]: string
    [nameSymbol]: string
    [uidSymbol]: string
}

/**
 * Update callback interface for shared objects.
 */
export interface UpdateOfSharedCallback {
    (update: unknown, prettyUpdate: unknown): void
    create?: Map<Shared, object>
    set?: Map<object, Array<unknown>>
    delete?: Set<Shared>
    isWaitingCommit?: boolean
    direction?: 'server-to-client' | 'client-to-server'
}

/**
 * Listeners storage type.
 */
export type ListenersStorage = Map<UpdateOfSharedCallback, number> | Set<UpdateOfSharedCallback>

/**
 * Shared object with define metadata.
 */
export interface Shared {
    [key: string]: unknown
    [idSymbol]: number
    [listenersOfSharedSymbol]: ListenersStorage
    constructor: (new () => object) & {
        [idSymbol]: number
        [nameSymbol]: string
        [uidSymbol]: string
    }
}

/**
 * Map of define names to numeric IDs.
 */
export type Defines = Record<PropertyKey, number>
