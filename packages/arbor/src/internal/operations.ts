import type ArborBase from './ArborBase'
import type ArborNode from '../ArborNode'
import type ArborTree from '../ArborTree'
import type { ArborContextClass, ArborDependency } from '../types'

/**
 * Type guard: checks if an ArborBase is an ArborTree.
 */
export function isArborTree(base: ArborBase): base is ArborTree {
    return (base as unknown as ArborTree).isArborTree === true
}

/**
 * Type guard: checks if an ArborBase is an ArborNode.
 */
export function isArborNode(base: ArborBase): base is ArborNode {
    return (base as unknown as ArborNode).isArborNode === true
}

/**
 * Pre-resolved promise for performance optimizations.
 */
export const RESOLVED = Promise.resolve()

/**
 * Validates that a value is not null/undefined at runtime.
 */
export function assertNotUndefined<T>(value: T, message: string): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(message)
    }
}

// ── Operation queue types ──────────────────────────────────────────────────

export interface ParentOperation {
    parent: ArborBase
    child: ArborNode
}

export interface DependencyOperation {
    node: ArborNode
    dependency: ArborDependency
}

export interface ContextOperation {
    target: ArborBase
    context: object
}

// ── Commit processing ──────────────────────────────────────────────────────

/**
 * Processes all pending operations on an ArborTree.
 * Operations are executed in order: removes first, then adds.
 * All queues are cleared after processing.
 */
export function processCommit(tree: ArborTree & Record<string, unknown>): void {
    const pendingRemoveParents = tree['__pendingRemoveParentOperations'] as ParentOperation[]
    const pendingRemoveDeps = tree['__pendingRemoveDependencyOperations'] as DependencyOperation[]
    const pendingRemoveContexts = tree['__pendingRemoveContextOperations'] as ContextOperation[]
    const pendingAddParents = tree['__pendingAddParentOperations'] as ParentOperation[]
    const pendingAddDeps = tree['__pendingAddDependencyOperations'] as DependencyOperation[]
    const pendingAddContexts = tree['__pendingAddContextOperations'] as ContextOperation[]

    // ── 1. Process removes (teardown before setup) ──

    for (const operation of pendingRemoveParents) {
        if (operation.child.disposed || operation.parent.disposed) {
            continue
        }

        const parentChildren = operation.parent._children
        if (parentChildren) {
            const idx = parentChildren.indexOf(operation.child)
            if (idx !== -1) {
                parentChildren.splice(idx, 1)
            }
        }

        // Remove contexts from parent
        if (operation.parent._contexts) {
            operation.child.__removeContexts(operation.parent._contexts)
        }

        // Remove from child's parents list
        const childParents = operation.child.__parents as ArborBase[]
        const parentIdx = childParents.indexOf(operation.parent)
        if (parentIdx !== -1) {
            childParents.splice(parentIdx, 1)
        }

        // If child has no parents left, dispose
        if (childParents.length === 0 && !operation.child.disposed) {
            operation.child.dispose()
        }
    }

    for (const operation of pendingRemoveDeps) {
        if (operation.node.disposed) {
            continue
        }

        const dep = operation.dependency
        if (Array.isArray(dep)) {
            const Context = dep[1]
            if (Context) {
                const owner = dep[0]
                if (owner._contextEffectsMap?.[Context.name]) {
                    const list = owner._contextEffectsMap[Context.name]!
                    const idx = list.indexOf(operation.node)
                    if (idx !== -1) {
                        list.splice(idx, 1)
                    }
                }
            }
        } else {
            if (dep.disposed) {
                continue
            }

            const nodeDeps = operation.node.__dependencies as ArborBase[]
            if (nodeDeps) {
                const depIdx = nodeDeps.indexOf(dep)
                if (depIdx !== -1) {
                    nodeDeps.splice(depIdx, 1)
                }
            }

            if (dep._effects) {
                const effectIdx = dep._effects.indexOf(operation.node)
                if (effectIdx !== -1) {
                    dep._effects.splice(effectIdx, 1)
                }
            }
        }
    }

    for (const operation of pendingRemoveContexts) {
        if (operation.target.disposed) {
            continue
        }

        const Context = operation.context.constructor as ArborContextClass
        if (Context.context == null) {
            throw new Error('class missing context property')
        }

        const contexts = operation.target._contexts
        if (contexts) {
            delete contexts[Context.name]
        }

        // Propagate context removal to children
        const children = operation.target._children
        if (children && children.length > 0) {
            const contextEntry: Record<string, object> = {}
            contextEntry[Context.name] = operation.context
            for (const child of children) {
                child.__removeContexts(contextEntry)
            }
        }
    }

    // ── 2. Process adds ──

    for (const operation of pendingAddParents) {
        if (operation.child.disposed || operation.parent.disposed) {
            continue
        }

        const parentChildren = operation.parent._children
        if (parentChildren) {
            if (parentChildren.indexOf(operation.child) === -1) {
                parentChildren.push(operation.child)
            }
        }

        // Register the parent before resolving contexts: __initContexts reads __parents
        const childParents = operation.child.__parents as ArborBase[]
        if (childParents.indexOf(operation.parent) === -1) {
            childParents.push(operation.parent)
        }

        // Init contexts from parent if available
        if (operation.parent._contexts) {
            operation.child.__initContexts()
        }
    }

    for (const operation of pendingAddDeps) {
        if (operation.node.disposed) {
            continue
        }

        const dep = operation.dependency

        if (Array.isArray(dep)) {
            const Context = dep[1]
            const owner = dep[0]

            if (Context) {
                const context = owner.context(Context)
                if (!context) {
                    throw new Error('ArborNode ~ addDeps: context missing on owner')
                }

                const effectsMap = owner._contextEffectsMap
                if (effectsMap) {
                    const list = effectsMap[Context.name]
                    if (list && list.indexOf(operation.node) === -1) {
                        list.push(operation.node)
                    }
                }
            }
        } else {
            if (dep.disposed) {
                continue
            }

            const nodeDeps = operation.node.__dependencies as ArborBase[]
            if (nodeDeps && nodeDeps.indexOf(dep) === -1) {
                nodeDeps.push(dep)
            }

            if (dep._effects && dep._effects.indexOf(operation.node) === -1) {
                dep._effects.push(operation.node)
            }
        }
    }

    for (const operation of pendingAddContexts) {
        if (operation.target.disposed) {
            continue
        }

        const Context = operation.context.constructor as ArborContextClass
        if (Context.context == null) {
            throw new Error('class missing context property')
        }

        const contexts = operation.target._contexts
        if (contexts) {
            contexts[Context.name] = operation.context
        }

        // Propagate context to children
        const children = operation.target._children
        if (children && children.length > 0) {
            const contextEntry: Record<string, object> = {}
            contextEntry[Context.name] = operation.context
            for (const child of children) {
                child.__addContexts(contextEntry)
            }
        }
    }

    // ── 3. Clear all queues ──
    pendingRemoveParents.length = 0
    pendingRemoveDeps.length = 0
    pendingRemoveContexts.length = 0
    pendingAddParents.length = 0
    pendingAddDeps.length = 0
    pendingAddContexts.length = 0
}

/**
 * Reverts `changeDisposeStatus` for a node that stays alive,
 * together with its children and dependents.
 */
export function restoreDisposeStatus(node: ArborBase): void {
    if (node._disposeStatus !== 'disposing') {
        return
    }

    node._disposeStatus = undefined

    for (const child of node._children) {
        restoreDisposeStatus(child)
    }

    if (node._effects) {
        for (const effect of node._effects) {
            restoreDisposeStatus(effect)
        }
    }
}

/**
 * Marks an effect and its children/dependents as "disposing".
 * Prevents new operations during disposal.
 */
export function changeDisposeStatus(node: ArborBase): void {
    node._disposeStatus = 'disposing'

    for (const child of node._children) {
        if (!child.disposed) {
            changeDisposeStatus(child)
        }
    }

    if (node._effects) {
        for (const effect of node._effects) {
            if (effect._disposeStatus === undefined) {
                changeDisposeStatus(effect)
            }
        }
    }
}
