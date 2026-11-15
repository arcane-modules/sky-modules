import { afterEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'

describe('audit: suspected defects', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('keeps descendants of a shared child alive when one of its parents is disposed', async () => {
        const tree = new ArborTree()
        const parentA = new ArborNode(tree)
        const parentB = new ArborNode(tree)
        const shared = new ArborNode(parentA)
        shared.addParent(parentB)
        const grandchild = new ArborNode(shared)
        tree.commit()

        await parentA.dispose()

        expect(shared.disposed).toBe(false)
        expect(grandchild.disposed).toBe(false)
    })

    it('removes all listeners when several register* methods wrap dispose', async () => {
        const added = new Map<string, EventListener>()
        const removed = new Set<string>()
        vi.stubGlobal('window', {
            addEventListener: (name: string, handler: EventListener): void => {
                added.set(name, handler)
            },
            removeEventListener: (name: string): void => {
                removed.add(name)
            },
            innerWidth: 1,
            innerHeight: 1,
        })

        const tree = new ArborTree()
        tree.registerMouseEvents()
        tree.registerEmitKeyboardEvents()
        await tree.dispose()

        expect(tree.disposed).toBe(true)
        expect([...removed].sort()).toEqual([...added.keys()].sort())
    })

    it('ignores removeParent for a node that is not a parent', () => {
        const tree = new ArborTree()
        const realParent = new ArborNode(tree)
        const stranger = new ArborNode(tree)
        const child = new ArborNode(realParent)
        tree.commit()

        child.removeParent(stranger)
        tree.commit()

        expect(child.disposed).toBe(false)
        expect(child.isChildOf(realParent)).toBe(true)
    })
})
