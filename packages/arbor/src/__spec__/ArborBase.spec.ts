import { beforeEach, describe, expect, it } from 'vitest'
import ArborBase from '../internal/ArborBase'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'
import type { ArborContextClass, ArborHandler } from '../types'

class TestBase extends ArborBase {
    get root(): ArborTree {
        return (this as unknown as { _root: ArborTree })._root
    }
}

describe('ArborBase', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
    })

    it('should have unique ID', () => {
        const b1 = new TestBase()
        const b2 = new TestBase()
        expect(b1.id).not.toBe(b2.id)
        expect(typeof b1.id).toBe('number')
    })

    it('should store host object', () => {
        const host = { value: 42 }
        const base = new TestBase(host)
        expect(base.host).toBe(host)
    })

    it('should handle null vs undefined host', () => {
        expect(new TestBase(null as unknown as object).host).toBeUndefined()
        expect(new TestBase(undefined).host).toBeUndefined()
        expect(new TestBase({}).host).toBeDefined()
    })

    it('should start as not disposed', () => {
        expect(tree.disposed).toBe(false)
    })

    it('should be disposed after dispose', async () => {
        await tree.dispose()
        expect(tree.disposed).toBe(true)
    })

    it('should support dispose idempotency', async () => {
        await tree.dispose()
        await tree.dispose()
        expect(tree.disposed).toBe(true)
    })

    it('should manage contexts', () => {
        class MyCtx {
            static context = true as const
            value = 'test'
        }

        const ctx = new MyCtx()
        tree.addContext(ctx)
        tree.commit()

        expect(tree.hasContext(MyCtx as unknown as ArborContextClass)).toBe(true)
        expect(tree.context(MyCtx as unknown as ArborContextClass)).toBe(ctx)
        expect(tree.maybeContext(MyCtx as unknown as ArborContextClass)).toBe(ctx)
    })

    it('should throw on missing context via context()', () => {
        class MissingCtx {
            static context = true as const
            value = 'nope'
        }

        expect(() => tree.context(MissingCtx as unknown as ArborContextClass)).toThrow('context')
    })

    it('should return undefined on missing context via maybeContext()', () => {
        class MissingCtx {
            static context = true as const
            value = 'nope'
        }

        expect(tree.maybeContext(MissingCtx as unknown as ArborContextClass)).toBeUndefined()
    })

    it('should dispatch events through children', () => {
        const parent = new ArborNode(tree)
        const child = new ArborNode(parent)
        tree.commit()

        const received: string[] = []

        const childTarget = (child.host ?? child) as Record<string, ArborHandler>
        childTarget.onTestEvent = () => {
            received.push('child')
        }

        const parentTarget = (parent.host ?? parent) as Record<string, ArborHandler>
        parentTarget.onTestEvent = () => {
            received.push('parent')
        }

        parent.dispatch('onTestEvent', {})
        expect(received).toEqual(['parent', 'child'])
    })

    it('should dispatchReverse events in opposite order', () => {
        const parent = new ArborNode(tree)
        const child = new ArborNode(parent)
        tree.commit()

        const received: string[] = []

        const childTarget = (child.host ?? child) as Record<string, ArborHandler>
        childTarget.onTestEvent = () => {
            received.push('child')
        }

        const parentTarget = (parent.host ?? parent) as Record<string, ArborHandler>
        parentTarget.onTestEvent = () => {
            received.push('parent')
        }

        parent.dispatchReverse('onTestEvent', {})
        expect(received).toEqual(['parent', 'child'])
    })

    it('should stop dispatch on captured event', () => {
        const parent = new ArborNode(tree)
        const child1 = new ArborNode(parent)
        const child2 = new ArborNode(parent)
        tree.commit()

        const received: string[] = []

        const child1Target = (child1.host ?? child1) as Record<string, ArborHandler>
        child1Target.onTestEvent = () => {
            received.push('child1')
        }

        const child2Target = (child2.host ?? child2) as Record<string, ArborHandler>
        child2Target.onTestEvent = () => {
            received.push('child2')
        }

        const parentTarget = (parent.host ?? parent) as Record<string, ArborHandler>
        parentTarget.onTestEvent = () => {
            received.push('parent')
        }

        parent.dispatch('onTestEvent', { isCaptured: false })
        expect(received).toContain('parent')
        expect(received).toContain('child1')
        expect(received).toContain('child2')
    })

    it('should not crash on dispatch with no handlers', () => {
        expect(() => {
            tree.dispatch('onNonExistentEvent', {})
        }).not.toThrow()
    })
})
