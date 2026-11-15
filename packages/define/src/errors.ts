/**
 * Errors related to the define system.
 */

export class DefineError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name

        // captureStackTrace exists only on V8 engines
        const { captureStackTrace } = Error as ErrorConstructor & {
            captureStackTrace?: (target: object, ctor: abstract new (...args: never[]) => object) => void
        }

        if (typeof captureStackTrace === 'function') {
            captureStackTrace(this, this.constructor as abstract new (...args: never[]) => object)
        }
    }
}

export class DuplicateDefineError extends DefineError {
    constructor(name: string) {
        super(`Duplicate define: ${name}`)
    }
}

export class InvalidDefineNameError extends DefineError {
    constructor(name: string) {
        super(`Invalid define name: "${name}". Name must match /^[a-zA-Z][a-zA-Z0-9_.]*$/`)
    }
}

export class RuntimeDefineError extends DefineError {
    constructor() {
        super('Cannot define at runtime. Only allowed during HMR.')
    }
}

export class RecursiveDefineError extends DefineError {
    constructor(name: string, stack: Array<string>) {
        super(
            `Recursive define detected: "${name}"\n` +
                `Define stack: ${stack.join(' → ')} → ${name}\n\n` +
                'Use runBeforeRuntime() for deferred registration to avoid circular imports.'
        )
    }
}
