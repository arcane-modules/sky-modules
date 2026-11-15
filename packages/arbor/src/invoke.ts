const INVOKES_KEY = '__arborInvokes'

/**
 * Stage 3 decorator that marks a class method as an invoke hook.
 * Metadata is stored on the class constructor via an initializer.
 *
 * When a class instance is used as a host for an ArborNode,
 * all methods decorated with @invoke are automatically registered
 * as hooks on the root ArborTree and cleaned up on dispose.
 *
 * Usage:
 *   class MySystem {
 *       @invoke('update')
 *       onUpdate(dt: number) { ... }
 *
 *       @invoke('render')
 *       onRender(ctx: CanvasRenderingContext2D) { ... }
 *
 *       @invoke('resize')
 *       onResize({ width, height }: { width: number; height: number }) { ... }
 *   }
 */
export function invoke(name: string) {
    return function invokeDecorator(_target: unknown, context: ClassMethodDecoratorContext): void {
        const methodName = context.name as string

        // Use addInitializer to capture the constructor at instance creation.
        // Deduplicate so metadata is only stored once per class.
        context.addInitializer(function (this: unknown) {
            const ctor = (this as object).constructor as unknown as Record<string, unknown>
            const meta = (ctor[INVOKES_KEY] as Record<string, string[]> | undefined) ?? {}
            const list = meta[name] ?? []
            if (!list.includes(methodName)) {
                list.push(methodName)
            }
            meta[name] = list
            ctor[INVOKES_KEY] = meta
        })
    }
}

/** @internal Read invoke metadata from a constructor */
export function __getInvokeMeta(ctor: object): Record<string, string[]> | undefined {
    return (ctor as Record<string, unknown>)[INVOKES_KEY] as Record<string, string[]> | undefined
}
