import ArborBase from './internal/ArborBase'
import type { ArborContextClass, ArborDependency, ArborHandler, ArborSetup, Destructor } from './types'
import type ArborTree from './ArborTree'

/**
 * Node in the Arbor ownership tree.
 *
 * ArborNode represents an owned resource with automatic cleanup.
 * Each node can have multiple parents (multi-ownership) and
 * multiple dependencies. When the last parent is removed,
 * the node is automatically disposed.
 *
 * @example
 * ```ts
 * const tree = new ArborTree()
 * const node = new ArborNode(tree)
 * const nodeWithCleanup = new ArborNode(() => {
 *   const timer = setInterval(() => {}, 1000)
 *   return () => clearInterval(timer)
 * }, tree)
 * ```
 */
export default class ArborNode extends ArborBase {
    readonly isArborNode = true as const
    readonly root: ArborTree

    /** @internal Parent node references */
    __parents: ArborBase[] = []

    /** @internal Dependency node references */
    __dependencies: ArborBase[] = []

    /** @internal Whether parent contexts have been resolved */
    __isParentContextsResolved = false

    /** @internal The setup destructor */
    private __destructor: Destructor | undefined

    /**
     * Creates a new ArborNode with a dependency.
     * @param dep Dependency (parent or context-aware tuple)
     * @param host Optional host for lifecycle hooks
     */
    constructor(dep: ArborDependency, host?: object)
    /**
     * Creates a new ArborNode with a setup callback and dependency.
     * @param setup Function that returns an optional destructor
     * @param dep Dependency (parent or context-aware tuple)
     * @param host Optional host for lifecycle hooks
     */
    constructor(setup: ArborSetup, dep: ArborDependency, host?: object)
    constructor(arg1: ArborDependency | ArborSetup, arg2?: ArborDependency | object, arg3?: object) {
        let setup: ArborSetup | undefined
        let dep: ArborDependency
        let host: object | undefined

        if (typeof arg1 === 'function') {
            setup = arg1
            dep = arg2 as ArborDependency
            host = arg3 as object | undefined
        } else {
            dep = arg1 as ArborDependency
            host = arg2 as object | undefined
        }

        super(host)

        // Extract parent from dependency
        let parent: ArborBase
        if (Array.isArray(dep)) {
            parent = dep[0]
        } else {
            parent = dep
        }

        if (!parent) {
            throw new Error('ArborNode: missing parent dependency')
        }

        this.root = parent.root

        // Scan for @invoke hooks now that root is available
        if (host) {
            this.__initInvokeHooks(host)
        }

        // Register parent relationship
        this.addParent(parent)

        // If context-aware dependency, register dependency
        if (Array.isArray(dep) && dep[1]) {
            this.addDep(dep)
        }

        // Run setup callback
        if (setup) {
            const destructor = setup.call(this)
            if (destructor) {
                this.__destructor = destructor
            }
        }
    }

    // ── Parent management ──────────────────────────────────────────────────

    /**
     * Adds a parent. Queued until commit().
     */
    addParent(parent: ArborBase): this {
        this.root['__pendingAddParentOperations'].push({
            parent,
            child: this,
        })
        return this
    }

    /**
     * Removes a parent. Queued until commit().
     * If this was the last parent, the node is disposed.
     */
    removeParent(parent: ArborBase): this {
        this.root['__pendingRemoveParentOperations'].push({
            parent,
            child: this,
        })
        return this
    }

    /**
     * Checks if this node is a child of the given parent.
     */
    isChildOf(parent: ArborBase): boolean {
        return this.__parents.indexOf(parent) !== -1
    }

    // ── Dependency management ──────────────────────────────────────────────

    /**
     * Adds a dependency. Queued until commit().
     */
    addDep(dep: ArborDependency): this {
        this.root['__pendingAddDependencyOperations'].push({
            node: this,
            dependency: dep,
        })
        return this
    }

    /**
     * Removes a dependency. Queued until commit().
     */
    removeDep(dep: ArborDependency): this {
        this.root['__pendingRemoveDependencyOperations'].push({
            node: this,
            dependency: dep,
        })
        return this
    }

    // ── Internal: context propagation ──────────────────────────────────────

    /**
     * Initializes contexts by collecting from parents.
     * Called during commit when parent relationships are established.
     * @internal
     */
    __initContexts(): void {
        if (!this.__isParentContextsResolved) {
            this.__isParentContextsResolved = true

            for (const parent of this.__parents) {
                // Recursively init parent contexts
                if (parent instanceof ArborNode) {
                    parent.__initContexts()
                }

                // Copy parent contexts to this node
                if (parent._contexts) {
                    this.__addContexts({ ...parent._contexts })
                }
            }
        }
    }

    /**
     * Adds contexts to this node and propagates to children.
     * @internal
     */
    __addContexts(contexts: Record<string, object>): void {
        this._contexts ??= {}

        for (const [key, context] of Object.entries(contexts)) {
            this._contexts[key] = context

            // Call context hook on host
            const target = this.host ?? this
            const hookName = `on${key}Context`
            const hook = (target as Record<string, ArborHandler | undefined>)[hookName]
            if (typeof hook === 'function') {
                const dispose = hook.call(target, context)
                if (dispose) {
                    // Create sub-node to manage context cleanup lifecycle
                    const ContextClass = context.constructor as ArborContextClass
                    const subNode = new ArborNode(() => dispose as Destructor, [this, ContextClass])
                    // Don't commit here — pending operations will be
                    // processed on the next user-initiated commit()

                    // Track context effects for cleanup
                    this._contextEffectsMap ??= {}
                    const effectList = this._contextEffectsMap[key]
                    if (effectList) {
                        effectList.push(subNode)
                    } else {
                        this._contextEffectsMap[key] = [subNode]
                    }
                }
            }
        }

        // Propagate to children
        for (const child of this._children) {
            child.__addContexts(contexts)
        }
    }

    /**
     * Removes contexts from this node and propagates to children.
     * Runs context cleanup effects.
     * @internal
     */
    __removeContexts(contexts: Record<string, object>): void {
        for (const key of Object.keys(contexts)) {
            if (this._contexts?.[key] == null) {
                continue
            }

            delete this._contexts[key]
        }

        // Dispose context cleanup effects
        for (const key of Object.keys(contexts)) {
            const effectList = this._contextEffectsMap?.[key]
            if (effectList) {
                for (const effect of effectList) {
                    if (!effect.disposed) {
                        effect.dispose()
                    }
                }
                delete this._contextEffectsMap![key]
            }
        }

        // Propagate to children
        for (const child of this._children) {
            child.__removeContexts(contexts)
        }
    }

    // ── Internal: dispose overrides ────────────────────────────────────────

    /**
     * Removes this node from all parents' children lists.
     */
    async __removeFromParents(): Promise<void> {
        for (const parent of this.__parents) {
            if (parent._disposeStatus === undefined) {
                const children = parent._children
                if (children) {
                    const idx = children.indexOf(this)
                    if (idx !== -1) {
                        children.splice(idx, 1)
                    }
                }
            }
        }

        this.__parents = []
    }

    /**
     * Removes this node from all dependencies' effects lists.
     */
    __removeFromDependents(): void {
        for (const dep of this.__dependencies) {
            if (dep._disposeStatus === undefined) {
                if (dep._effects) {
                    const idx = dep._effects.indexOf(this)
                    if (idx !== -1) {
                        dep._effects.splice(idx, 1)
                    }
                }
            }
        }

        this.__dependencies = []
    }

    /**
     * Runs the stored destructor.
     * First clears invoke hooks, then runs the setup callback destructor.
     */
    async __runDestructor(): Promise<void> {
        // Unsubscribe invoke hooks (from ArborBase)
        await super.__runDestructor()

        if (this.__destructor) {
            await this.__destructor()
            this.__destructor = undefined
        }
    }
}
