/**
 * Minimal runtime hooks for the define system.
 */

let _isRuntime = false
let _isHot = false

const beforeRuntimeCallbacks: Array<() => void | Promise<void>> = []

export function isRuntime(): boolean {
    return _isRuntime
}

export function isHot(): boolean {
    return _isHot
}

export function setRuntime(value: boolean): void {
    _isRuntime = value
}

export function setHot(value: boolean): void {
    _isHot = value
}

export function runBeforeRuntime(callback: () => void | Promise<void>): void {
    if (_isRuntime) {
        void callback()
    } else {
        beforeRuntimeCallbacks.push(callback)
    }
}

export async function startRuntime(): Promise<void> {
    for (const callback of beforeRuntimeCallbacks) {
        await callback()
    }
    beforeRuntimeCallbacks.length = 0
    _isRuntime = true
}

export type HotUpdateHandler = (name: string, oldValue: unknown, newValue: unknown) => void

/** Any class constructor, abstract or not. */
export type ClassConstructor = abstract new (...args: never[]) => object

export type HotClassUpdateHandler = (name: string, oldClass: ClassConstructor, newClass: ClassConstructor) => void

let _hotValueHandler: HotUpdateHandler | null = null
let _hotClassHandler: HotClassUpdateHandler | null = null

export function registerHotValueHandler(handler: HotUpdateHandler): void {
    _hotValueHandler = handler
}

export function registerHotClassHandler(handler: HotClassUpdateHandler): void {
    _hotClassHandler = handler
}

export function notifyHotValueUpdate(name: string, oldValue: unknown, newValue: unknown): void {
    _hotValueHandler?.(name, oldValue, newValue)
}

export function notifyHotClassUpdate(name: string, oldClass: ClassConstructor, newClass: ClassConstructor): void {
    _hotClassHandler?.(name, oldClass, newClass)
}
