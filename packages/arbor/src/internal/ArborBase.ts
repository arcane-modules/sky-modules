import { changeDisposeStatus, restoreDisposeStatus } from './operations'
import { __getInvokeMeta } from '../invoke'
import type ArborNode from '../ArborNode'
import type ArborTree from '../ArborTree'
import type { ArborContextClass, ArborEvent, ArborHandler } from '../types'

let uniqueId = 0

/**
 * Abstract base class for the Arbor system.
 *
 * Provides core lifecycle management, context propagation,
 * event dispatch, and parent-child relationships.
 *
 * Both ArborTree (root) and ArborNode (nodes) extend this class.
 */
export default abstract class ArborBase {
    readonly id: number
    readonly host?: object

    /**
     * Reference to the root ArborTree.
     */
    abstract get root(): ArborTree

    // ── Protected state ──────────────────────────────────────────────────────

    /** @internal */
    _disposeStatus: undefined | 'disposing' | 'disposed'
    /** @internal */
    _children: ArborNode[]
    /** @internal */
    _contexts: Record<string, object> = {}
    /** @internal */
    _effects: undefined | ArborNode[]
    /** @internal */
    _contextEffectsMap: undefined | Record<string, ArborNode[]>

    // ── Invoke hooks ────────────────────────────────────────────────────────

    /** @internal Unsubscribe functions for invoke hooks */
    __invokeUnsubs: (() => void)[] = []

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(host?: object) {
        this.id = ++uniqueId

        if (host != null) {
            this.host = host
        }

        // If host class has static context = true, register host as context
        const MaybeContext = host?.constructor as ArborContextClass | undefined
        if (MaybeContext?.context) {
            this._contexts[MaybeContext.name] = host as object
        }

        this._children = []
    }

    /**
     * Scans host for @invoke decorators and registers hooks.
     * Must be called AFTER root is available (ArborNode overrides).
     * @internal
     */
    __initInvokeHooks(host: object): void {
        this.__scanInvokeHooks(host)
    }

    // ── Dispose status ───────────────────────────────────────────────────────

    /**
     * Whether this instance has been disposed or is being disposed.
     */
    get disposed(): boolean {
        return this._disposeStatus != null
    }

    // ── Dispose (getter/setter pattern) ──────────────────────────────────────

    private __customDispose: undefined | (() => void | Promise<void>)

    /**
     * Returns the dispose function for this instance.
     */
    get dispose(): () => Promise<void> {
        return this.__dispose
    }

    /**
     * Sets a custom dispose function that wraps the internal __dispose.
     * Custom functions chain: the newest runs first, then earlier ones,
     * then the internal cleanup.
     */
    set dispose(fn: () => void | Promise<void>) {
        const previous = this.__customDispose
        this.__customDispose = previous
            ? async (): Promise<void> => {
                  await fn()
                  await previous()
              }
            : fn
    }

    /**
     * Core disposal handler.
     * Calls custom dispose if set, then runs internal cleanup.
     * Custom dispose may call origDispose() internally — this is handled
     * by checking _disposeStatus and not re-entering __customDispose.
     */
    private __dispose = async (): Promise<void> => {
        if (this._disposeStatus === 'disposed') {
            return
        }

        if (this.__customDispose) {
            // Prevent re-entry: if custom dispose calls origDispose,
            // __dispose sees 'disposing' and returns early
            if (this._disposeStatus === 'disposing') {
                return
            }

            this._disposeStatus = 'disposing'
            await this.__customDispose()
        }

        // Guard: custom dispose might have disposed already
        if ((this._disposeStatus as string) === 'disposed') {
            return
        }

        await this.__internalDispose()
    }

    // ── Internal dispose protocol ───────────────────────────────────────────

    /**
     * Full internal dispose: marks tree, removes from parents,
     * removes from dependents, disposes children, runs destructor.
     */
    async __internalDispose(): Promise<void> {
        changeDisposeStatus(this)

        // Remove from parents
        await this.__removeFromParents()

        // Remove from dependents
        this.__removeFromDependents()

        // Dispose children
        if (this._children.length > 0) {
            const children = [...this._children]
            this._children = []

            for (const child of children) {
                if (child._disposeStatus !== 'disposed') {
                    // Check multi-parent: if child has other parents,
                    // just remove this parent reference, don't dispose
                    const childParents = (child as unknown as Record<string, unknown>)['__parents'] as
                        | ArborBase[]
                        | undefined
                    const otherParents = childParents?.filter((p) => p !== this && p._disposeStatus === undefined)

                    if (otherParents && otherParents.length > 0) {
                        // Child has other live parents — just disconnect
                        if (childParents) {
                            const idx = childParents.indexOf(this)
                            if (idx !== -1) childParents.splice(idx, 1)
                        }
                        // Reset dispose status — child and its subtree stay alive
                        restoreDisposeStatus(child)
                    } else {
                        await child.dispose()
                    }
                }
            }
        }

        // Dispose dependent effects
        if (this._effects) {
            const effects = [...this._effects]
            this._effects = []

            for (const effect of effects) {
                if (effect._disposeStatus !== 'disposed') {
                    await effect.dispose()
                }
            }
        }

        // Run destructor
        await this.__runDestructor()

        this._disposeStatus = 'disposed'
    }

    /**
     * Removes this instance from all parents' children lists.
     * Overridden in ArborNode to also remove from __parents.
     */
    async __removeFromParents(): Promise<void> {
        // Base: nothing to do — ArborTree has no parents
        // ArborNode overrides this
    }

    /**
     * Removes this instance from all dependents' effects lists.
     */
    __removeFromDependents(): void {
        if (!this._effects) {
            return
        }

        for (const effect of this._effects) {
            const effectDeps = (effect as ArborNode)['__dependencies'] as ArborBase[] | undefined
            if (effectDeps) {
                const idx = effectDeps.indexOf(this)
                if (idx !== -1) {
                    effectDeps.splice(idx, 1)
                }
            }
        }
    }

    /**
     * Runs the destructor (setup callback's return value).
     * Overridden in ArborNode.
     */
    async __runDestructor(): Promise<void> {
        // Unsubscribe all invoke hooks
        for (const unsub of this.__invokeUnsubs) {
            unsub()
        }
        this.__invokeUnsubs = []
        // Base: nothing else — ArborTree has no setup callback
        // ArborNode overrides this
    }

    // ── Invoke hooks scanning ───────────────────────────────────────────────

    /**
     * Scans the host object's class metadata for @invoke decorators
     * and registers matching methods as invoke hooks on the root tree.
     */
    private __scanInvokeHooks(host: object): void {
        const invokes = __getInvokeMeta(host.constructor)
        if (!invokes) return

        for (const [hookName, methodNames] of Object.entries(invokes)) {
            for (const methodName of methodNames) {
                const method = (host as Record<string, ArborHandler | undefined>)[methodName]
                if (typeof method === 'function') {
                    const bound = method.bind(host)
                    const unsub = this.root.__registerInvokeHook(hookName, bound)
                    this.__invokeUnsubs.push(unsub)
                }
            }
        }
    }

    // ── Context management ──────────────────────────────────────────────────

    /**
     * Adds a context instance to this node.
     * The context is queued and applied during the next commit().
     */
    addContext(context: object): this {
        this.root['__pendingAddContextOperations'].push({
            context,
            target: this,
        })
        return this
    }

    /**
     * Removes a context instance from this node.
     * The context removal is queued and applied during the next commit().
     */
    removeContext(context: object): this {
        this.root['__pendingRemoveContextOperations'].push({
            context,
            target: this,
        })
        return this
    }

    /**
     * Checks if a context of the specified type is available.
     */
    hasContext(Context: ArborContextClass): boolean {
        return this._contexts[Context.name] != null
    }

    /**
     * Retrieves a context instance of the specified type.
     * Throws if the context is not available.
     */
    context<T extends ArborContextClass>(Context: T): InstanceType<T> {
        const value = this._contexts[Context.name]
        if (value == null) {
            throw new Error(`Arbor ~ context: "${Context.name}" not found`)
        }

        return value as InstanceType<T>
    }

    /**
     * Retrieves a context instance of the specified type.
     * Returns undefined if the context is not available.
     */
    maybeContext<T extends ArborContextClass>(Context: T): InstanceType<T> | undefined {
        return this._contexts[Context.name] as InstanceType<T> | undefined
    }

    // ── Event dispatch ──────────────────────────────────────────────────────

    /**
     * Dispatches an event down through the tree (parent → children).
     * Children receive the event in insertion order.
     */
    dispatch<T extends ArborEvent>(eventName: string, event: T): this {
        event.isCaptured ??= false

        // Call on self first
        const target = this.host ?? this
        const handler = (target as Record<string, ArborHandler>)[eventName]
        if (typeof handler === 'function') {
            handler.call(target, event)
        }

        // Propagate to children
        for (const child of this._children) {
            child.dispatch(eventName, event)
            if (event.isCaptured) {
                break
            }
        }

        return this
    }

    /**
     * Dispatches an event in reverse order (self first, then children in reverse).
     */
    dispatchReverse<T extends ArborEvent>(eventName: string, event: T): this {
        event.isCaptured ??= false

        // Call on self first
        const target = this.host ?? this
        const handler = (target as Record<string, ArborHandler>)[eventName]
        if (typeof handler === 'function') {
            handler.call(target, event)
        }

        // Propagate to children in reverse order
        for (let i = this._children.length - 1; i >= 0; i--) {
            const child = this._children[i]!
            child.dispatchReverse(eventName, event)
            if (event.isCaptured) {
                break
            }
        }

        return this
    }
}
