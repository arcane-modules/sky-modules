import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'
import type { ArborContextClass } from '../types'

describe('Contexts', () => {
    let tree: ArborTree

    const AppConfig = class AppConfig {
        static context = true as const
        constructor(public value: string) {}
    } as unknown as ArborContextClass & (new (value: string) => { value: string })

    const UserSession = class UserSession {
        static context = true as const
        constructor(public token: string) {}
    } as unknown as ArborContextClass & (new (token: string) => { token: string })

    beforeEach(() => {
        tree = new ArborTree()
    })

    it('should propagate context to children', () => {
        tree.addContext(new AppConfig('test'))
        const child = new ArborNode(tree)
        tree.commit()

        expect(child.hasContext(AppConfig)).toBe(true)
        expect(child.context(AppConfig).value).toBe('test')
    })

    it('should propagate context through chain', () => {
        tree.addContext(new AppConfig('root'))
        const middle = new ArborNode(tree)
        const leaf = new ArborNode(middle)
        tree.commit()

        expect(leaf.hasContext(AppConfig)).toBe(true)
        expect(leaf.context(AppConfig).value).toBe('root')
    })

    it('should not leak context to siblings', () => {
        const child1 = new ArborNode(tree)
        const child2 = new ArborNode(tree)
        tree.commit()

        child1.addContext(new AppConfig('only-child1'))
        tree.commit()

        expect(child2.hasContext(AppConfig)).toBe(false)
    })

    it('should remove context from children on remove', () => {
        tree.addContext(new AppConfig('test'))
        const child = new ArborNode(tree)
        tree.commit()

        expect(child.hasContext(AppConfig)).toBe(true)

        tree.removeContext(tree._contexts['AppConfig']!)
        tree.commit()

        expect(child.hasContext(AppConfig)).toBe(false)
    })

    it('should call context hooks on host', () => {
        const hook = vi.fn()

        class Host {
            effect: ArborNode
            constructor() {
                this.effect = new ArborNode(tree, this)
            }
            onAppConfigContext(ctx: { value: string }): void {
                hook(ctx)
            }
        }

        new Host()
        tree.commit()
        expect(hook).not.toHaveBeenCalled()

        tree.addContext(new AppConfig('test'))
        tree.commit()

        expect(hook).toHaveBeenCalledWith(expect.objectContaining({ value: 'test' }))
    })

    it('should run context hook cleanup on context remove', async () => {
        const cleanup = vi.fn()

        class Host {
            effect: ArborNode
            constructor() {
                this.effect = new ArborNode(tree, this)
            }
            onAppConfigContext(): () => void {
                return cleanup
            }
        }

        new Host()
        tree.addContext(new AppConfig('test'))
        tree.commit()

        expect(cleanup).not.toHaveBeenCalled()

        tree.removeContext(tree._contexts['AppConfig']!)
        tree.commit()

        // Flush microtasks — context cleanup effets are async
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(cleanup).toHaveBeenCalled()
    })

    it('should support multiple contexts', () => {
        tree.addContext(new AppConfig('app'))
        tree.addContext(new UserSession('token-123'))
        const child = new ArborNode(tree)
        tree.commit()

        expect(child.context(AppConfig).value).toBe('app')
        expect(child.context(UserSession).token).toBe('token-123')
    })

    it('should propagate a host context to children created in the same commit', async () => {
        const setup = vi.fn()
        const cleanup = vi.fn()

        class Stage {
            static context = true as const
            node: ArborNode
            constructor() {
                this.node = new ArborNode(tree, this)
            }
        }

        class Actor {
            node: ArborNode
            constructor(parent: ArborNode) {
                this.node = new ArborNode(parent, this)
            }
            onStageContext(stage: Stage): () => void {
                setup(stage)
                return cleanup
            }
        }

        const stage = new Stage()
        const actor = new Actor(stage.node)
        tree.commit()

        expect(actor.node.context(Stage as unknown as ArborContextClass)).toBe(stage)
        expect(setup).toHaveBeenCalledWith(stage)

        await stage.node.dispose()

        expect(cleanup).toHaveBeenCalledOnce()
    })

    it('should support addContext on node (not root)', () => {
        const child = new ArborNode(tree)
        tree.commit()

        class LocalCtx {
            static context = true as const
            value = 'local'
        }

        const Ctx = LocalCtx as unknown as ArborContextClass
        child.addContext(new LocalCtx())
        tree.commit()

        expect(child.hasContext(Ctx)).toBe(true)
        expect(tree.hasContext(Ctx)).toBe(false)
    })

    it('should support context() throws for missing', () => {
        // biome-ignore lint/complexity/noStaticOnlyClass: context marker class is static-only by design
        class Missing {
            static context = true as const
        }
        expect(() => tree.context(Missing as unknown as ArborContextClass)).toThrow('context')
    })

    it('should support maybeContext() returns undefined for missing', () => {
        // biome-ignore lint/complexity/noStaticOnlyClass: context marker class is static-only by design
        class Missing {
            static context = true as const
        }
        expect(tree.maybeContext(Missing as unknown as ArborContextClass)).toBeUndefined()
    })
})
