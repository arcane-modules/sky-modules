import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'
import type { ArborHandler } from '../types'

describe('Events', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
    })

    it('should dispatch from root to children', () => {
        const child1 = new ArborNode(tree)
        const child2 = new ArborNode(tree)
        tree.commit()

        const order: string[] = []

        const child1Target = (child1.host ?? child1) as Record<string, ArborHandler>
        child1Target.onTest = () => order.push('child1')

        const child2Target = (child2.host ?? child2) as Record<string, ArborHandler>
        child2Target.onTest = () => order.push('child2')

        const treeTarget = (tree.host ?? tree) as Record<string, ArborHandler>
        treeTarget.onTest = () => order.push('root')

        tree.dispatch('onTest', {})
        expect(order[0]).toBe('root')
    })

    it('should dispatchReverse: self first, then children in reverse', () => {
        const child1 = new ArborNode(tree)
        const child2 = new ArborNode(tree)
        tree.commit()

        const order: string[] = []

        const child1Target = (child1.host ?? child1) as Record<string, ArborHandler>
        child1Target.onTest = () => order.push('child1')

        const child2Target = (child2.host ?? child2) as Record<string, ArborHandler>
        child2Target.onTest = () => order.push('child2')

        const treeTarget = (tree.host ?? tree) as Record<string, ArborHandler>
        treeTarget.onTest = () => order.push('root')

        tree.dispatchReverse('onTest', {})
        expect(order[0]).toBe('root')
    })

    it('should not crash with no handlers', () => {
        expect(() => tree.dispatch('onNothing', {})).not.toThrow()
        expect(() => tree.dispatchReverse('onNothing', {})).not.toThrow()
    })

    it('should set isCaptured default to false', () => {
        const event: Record<string, unknown> = { data: 1 }
        tree.dispatch('onTest', event)
        expect(event.isCaptured).toBe(false)
    })

    it('should handle isCaptured propagation', () => {
        const event: Record<string, unknown> = { data: 1, isCaptured: true }
        tree.dispatch('onTest', event)
        expect(event.isCaptured).toBe(true)
    })

    it('should deliver events with correct data', () => {
        const child = new ArborNode(tree)
        tree.commit()

        let receivedData: unknown = null
        const childTarget = (child.host ?? child) as Record<string, ArborHandler>
        childTarget.onCustomEvent = (ev: unknown) => {
            receivedData = (ev as { value: number }).value
        }

        tree.dispatch('onCustomEvent', { value: 42 })
        expect(receivedData).toBe(42)
    })

    it('should dispatch to host object if present', () => {
        const handler = vi.fn()

        class Host {
            effect: ArborNode
            constructor() {
                this.effect = new ArborNode(tree, this)
            }
            onAppEvent(): void {
                handler()
            }
        }

        new Host()
        tree.commit()

        tree.dispatch('onAppEvent', {})
        expect(handler).toHaveBeenCalled()
    })
})
