/**
 * Shared state for the define system.
 */

import type { Static, Defines } from './types'

let _uniqueId = 1

export function getUniqueId(): number {
    return _uniqueId
}

export function setUniqueId(value: number): void {
    _uniqueId = value
}

export function nextUniqueId(): number {
    return _uniqueId++
}

/** Map of class names to their numeric IDs (loaded from schema.json). */
export const loadedDefines: Defines = {}

/** Map of all registered define values. */
export const defines: Record<string, { name: string; value: Static }> = {}

let _schemaLoaded = false

export function getSchemaLoaded(): boolean {
    return _schemaLoaded
}

export function setSchemaLoaded(value: boolean): void {
    _schemaLoaded = value
}
