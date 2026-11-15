import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'

describe('ArborNode', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
    })

    it('should create node with dependency only', () => {
        const node = new ArborNode(tree)
        expect(node.isArborNode).toBe(true)
        expect(node.root).toBe(tree)
        expect(node.disposed).toBe(false)
    })

    it('should create node with callback and cleanup', () => {
        const cleanup = vi.fn()
        const node = new ArborNode(() => cleanup, tree)
        expect(node.isArborNode).toBe(true)
        expect(cleanup).not.toHaveBeenCalled()
    })

    it('should throw on null parent', () => {
        expect(() => new ArborNode(null as unknown as ArborTree)).toThrow('parent')
    })

    it('should throw on undefined parent', () => {
        expect(() => new ArborNode(undefined as unknown as ArborTree)).toThrow('parent')
    })

    it('should call cleanup on dispose', async () => {
        const cleanup = vi.fn()
        const node = new ArborNode(() => cleanup, tree)
        tree.commit()
        await node.dispose()
        expect(cleanup).toHaveBeenCalled()
        expect(node.disposed).toBe(true)
    })

    it('should cascade dispose to children', async () => {
        const cleanup = vi.fn()
        const parent = new ArborNode(tree)
        const child = new ArborNode(() => cleanup, parent)
        tree.commit()

        expect(child.disposed).toBe(false)
        await parent.dispose()

        expect(cleanup).toHaveBeenCalled()
        expect(child.disposed).toBe(true)
        expect(parent.disposed).toBe(true)
    })

    it('should dispose children before parent', async () => {
        const order: string[] = []

        const parent = new ArborNode(() => {
            return () => {
                order.push('parent-cleanup')
            }
        }, tree)

        const child = new ArborNode(() => {
            return () => {
                order.push('child-cleanup')
            }
        }, parent)
        void child

        tree.commit()

        expect(order).toEqual([])

        await parent.dispose()
        expect(order).toEqual(['child-cleanup', 'parent-cleanup'])
    })

    it('should support multi-parent: dispose one parent keeps node alive', async () => {
        const parent1 = new ArborNode(tree)
        const parent2 = new ArborNode(tree)
        const shared = new ArborNode(parent1)
        shared.addParent(parent2)
        tree.commit()

        await parent1.dispose()
        expect(shared.disposed).toBe(false)

        await parent2.dispose()
        expect(shared.disposed).toBe(true)
    })

    it('should support isChildOf check', () => {
        const parent = new ArborNode(tree)
        const child = new ArborNode(parent)
        tree.commit()

        expect(child.isChildOf(parent)).toBe(true)
        const other = new ArborNode(tree)
        expect(child.isChildOf(other)).toBe(false)
    })

    it('should support removeParent via commit', () => {
        const p = new ArborNode(tree)
        const child = new ArborNode(p)
        tree.commit()

        child.removeParent(p)
        tree.commit()
        expect(child.disposed).toBe(true)
    })

    it('should handle null callback', () => {
        const node = new ArborNode(() => undefined, tree)
        tree.commit()
        expect(node.disposed).toBe(false)
    })
})
