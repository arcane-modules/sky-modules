/**
 * Core define decorator for registering classes, objects, and functions.
 *
 * @example
 * ```typescript
 * import define from '@sky-modules/define'
 *
 * // As class decorator
 * @define('app.MyService')
 * class MyService {
 *     doSomething() {}
 * }
 *
 * // As function
 * define('app.utils.helper', function helper() {
 *     return 'help'
 * })
 *
 * // As object
 * define('app.config', { apiUrl: 'https://api.example.com' })
 * ```
 */

import { DuplicateDefineError, InvalidDefineNameError, RuntimeDefineError, RecursiveDefineError } from './errors'
import { typeSymbol, nameSymbol, uidSymbol, idSymbol } from './internal/symbols'
import { defines, loadedDefines, nextUniqueId } from './internal/state'
import { isRuntime, isHot, runBeforeRuntime, notifyHotValueUpdate, notifyHotClassUpdate } from './internal/runtime'

import type { Static } from './internal/types'

type Class = new (...args: Array<unknown>) => object

const definingStack: Array<string> = []

/**
 * @global
 * Validates a define name.
 *
 * @param name - Name to validate.
 */
function validateDefineName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new InvalidDefineNameError(name)
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(name)) {
        throw new InvalidDefineNameError(name)
    }
}

// Register define itself
runBeforeRuntime(async () => {
    define('sky.define.define', define)
})

/**
 * @global
 * Registers a value or class in the module system.
 * Can be used as a function or decorator.
 *
 * @typeParam Class - Class type for decorator usage.
 * @typeParam T - Value type for function usage.
 */
function define(name: string): (target: Class) => void

/**
 * @global
 * Registers a value or class in the module system (function overload).
 *
 * @typeParam T - Value type.
 */
function define<T extends object>(name: string, value: T): T

/**
 * @global
 * Registers a value or class in the module system (default overload).
 *
 * @param name - Name to register.
 * @param valueOrOptions - Value to register or decorator options.
 * @returns Registered value.
 */
function define(name: string, valueOrOptions?: object): unknown {
    if (definingStack.includes(name)) {
        throw new RecursiveDefineError(name, definingStack)
    }

    definingStack.push(name)

    try {
        const value = valueOrOptions

        validateDefineName(name)

        if (defines[name] != null && isRuntime() && !isHot()) {
            throw new DuplicateDefineError(name)
        }

        if (isRuntime() && !isHot()) {
            throw new RuntimeDefineError()
        }

        if (value != null) {
            const oldValue = defines[name]?.value

            const def = {
                name,
            } as {
                name: string
                value: Static
            }

            if (typeof value === 'object') {
                def.value = value as Static
                def.value[typeSymbol] = Array.isArray(value) ? 'array' : 'object'
            } else if (typeof value === 'function') {
                def.value = value as Static
                def.value[typeSymbol] = 'func'
            } else {
                throw new InvalidDefineNameError(name)
            }

            def.value[nameSymbol] = name.split('.').pop() as string
            def.value[uidSymbol] = name

            defines[name] = def

            if (oldValue != null && isHot()) {
                notifyHotValueUpdate(name, oldValue, value)
            }

            return value
        }

        return function defineDecorator<T extends Class>(Target: T): void {
            if (isRuntime() && !isHot()) {
                throw new RuntimeDefineError()
            }

            const oldClass = defines[name]?.value

            const target = Target as unknown as Static
            target[typeSymbol] = 'class'
            target[nameSymbol] = Target.name
            target[uidSymbol] = name

            const loadedId = loadedDefines[name]

            if (loadedId != null) {
                target[idSymbol] = loadedId
            } else {
                const autoId = nextUniqueId()
                loadedDefines[name] = autoId
                target[idSymbol] = autoId
            }

            defines[name] = {
                name,
                value: target,
            }

            if (oldClass != null && isHot()) {
                notifyHotClassUpdate(name, oldClass, Target)
            }
        }
    } finally {
        definingStack.pop()
    }
}

export default define
