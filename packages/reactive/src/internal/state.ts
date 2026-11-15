/**
 * Global registry for defines and their metadata.
 * Stores all registered classes/objects with their IDs.
 */

import type { idSymbol, uidSymbol, typeSymbol, nameSymbol } from './symbols'

/** Static value interface — a registered define value */
export interface Static {
    [idSymbol]?: number
    [uidSymbol]?: string
    [typeSymbol]?: string
    [nameSymbol]?: string
    prototype?: Record<string, unknown>
    new (...args: unknown[]): object
    [key: symbol]: unknown
}

/** Registry entry */
export interface DefineEntry {
    name: string
    value: Static
}

/** Map of name → define entry */
export const defines = {} as Record<string, DefineEntry>

/** Map of name → loaded ID (from CLI migration system) */
export const loadedDefines = {} as Record<string, number>

/** Auto-incrementing ID counter for development/testing */
let nextId = 1

/** Get next unique ID */
export function nextUniqueId(): number {
    return nextId++
}

/** Clear the registry (for testing) */
export function clearRegistry(): void {
    for (const key of Object.keys(defines)) {
        delete defines[key]
    }

    for (const key of Object.keys(loadedDefines)) {
        delete loadedDefines[key]
    }

    nextId = 1
}

/** Get a define by name */
export function getDefine(name: string): DefineEntry | undefined {
    return defines[name]
}

/** Check if a define exists */
export function hasDefine(name: string): boolean {
    return name in defines
}

/** Get all registered define names */
export function getDefineNames(): string[] {
    return Object.keys(defines)
}
