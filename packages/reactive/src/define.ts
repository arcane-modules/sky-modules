/**
 * @define decorator — registers classes/schemas in the module system.
 *
 * Provides:
 * - Module registration and discovery
 * - Type-safe access to defined classes
 * - Duplicate detection
 * - Auto-generated IDs for testing
 *
 * @example
 * ```typescript
 * @define('game.Player')
 * class Player {
 *     @number health = 100
 * }
 * ```
 */

import { idSymbol, nameSymbol, typeSymbol, uidSymbol } from './internal/symbols'
import { defines, loadedDefines, nextUniqueId, type Static } from './internal/state'

/** Error thrown when a define name already exists */
export class DuplicateDefineError extends Error {
    constructor(name: string) {
        super(`Duplicate define: ${name}`)
        this.name = 'DuplicateDefineError'
    }
}

/** Error thrown when a define name format is invalid */
export class InvalidDefineNameError extends Error {
    constructor(name: string) {
        super(`Invalid define name: ${name}`)
        this.name = 'InvalidDefineNameError'
    }
}

/**
 * Validate define name format.
 * Must start with a letter and contain only alphanumeric chars, dots, underscores.
 */
function validateDefineName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new InvalidDefineNameError(String(name))
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(name)) {
        throw new InvalidDefineNameError(name)
    }
}

/**
 * Type alias for class constructor (no symbol index — casted internally)
 */
type Class = new (...args: unknown[]) => object

/**
 * Register a class in the define system.
 * Can be used as a decorator.
 *
 * @param name - Unique identifier (e.g., 'game.Player')
 * @throws {DuplicateDefineError} If name is already registered
 * @throws {InvalidDefineNameError} If name format is invalid
 */
function define(name: string): (target: Class) => void
function define<T extends Class>(name: string, value: T): T
function define<T extends Class>(name: string, value?: T): ((target: Class) => void) | T {
    validateDefineName(name)

    if (defines[name] != null) {
        throw new DuplicateDefineError(name)
    }

    if (value != null) {
        registerClass(name, value as unknown as Class)
        return value
    }

    // Return decorator factory
    return function defineDecorator(target: Class): void {
        registerClass(name, target)
    }
}

/**
 * Register a class in the define system
 */
function registerClass(name: string, target: Class): void {
    const st = target as unknown as Static
    st[typeSymbol] = 'class'
    st[nameSymbol] = name.split('.').pop() ?? ''
    st[uidSymbol] = name

    // Set class ID from loadedDefines or auto-generate
    const loadedId = loadedDefines[name]

    if (loadedId != null) {
        st[idSymbol] = loadedId
    } else {
        const autoId = nextUniqueId()
        loadedDefines[name] = autoId
        st[idSymbol] = autoId
    }

    defines[name] = {
        name,
        value: st,
    }
}

export default define
export { define }
