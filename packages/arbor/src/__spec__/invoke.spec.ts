import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'
import { invoke } from '../invoke'

describe('@invoke decorator', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
        vi.useFakeTimers()
    })

    it('should register update hook from host', () => {
        const calls: number[] = []

        class System {
            node: ArborNode

            constructor() {
                this.node = new ArborNode(tree, this)
            }

            @invoke('update')
            onUpdate(dt: number): void {
                calls.push(dt)
            }
        }

        new System()
        tree.commit()

        // Dispatch manually (without RAF)
        tree.__invokeHooksDispatch('update', 0.016)
        expect(calls).toEqual([0.016])

        // Dispatch again
        tree.__invokeHooksDispatch('update', 0.032)
        expect(calls).toEqual([0.016, 0.032])
    })

    it('should register render hook from host', () => {
        const calls: unknown[] = []

        class System {
            node: ArborNode

            constructor() {
                this.node = new ArborNode(tree, this)
            }

            @invoke('render')
            onRender(): void {
                calls.push('render')
            }
        }

        new System()
        tree.commit()

        tree.__invokeHooksDispatch('render', {})
        expect(calls).toEqual(['render'])
    })

    it('should register resize hook from host', () => {
        const calls: Array<{ width: number; height: number }> = []

        class System {
            node: ArborNode

            constructor() {
                this.node = new ArborNode(tree, this)
            }

            @invoke('resize')
            onResize(dims: { width: number; height: number }): void {
                calls.push(dims)
            }
        }

        new System()
        tree.commit()

        tree.__invokeHooksDispatch('resize', { width: 800, height: 600 })
        expect(calls).toEqual([{ width: 800, height: 600 }])
    })

    it('should support multiple hooks on same host', () => {
        const updates: number[] = []
        const renders: string[] = []

        class System {
            node: ArborNode

            constructor() {
                this.node = new ArborNode(tree, this)
            }

            @invoke('update')
            onUpdate(dt: number): void {
                updates.push(dt)
            }

            @invoke('render')
            onRender(): void {
                renders.push('render')
            }
        }

        new System()
        tree.commit()

        tree.__invokeHooksDispatch('update', 0.1)
        tree.__invokeHooksDispatch('render', {})

        expect(updates).toEqual([0.1])
        expect(renders).toEqual(['render'])
    })

    it('should unregister hooks on node dispose', async () => {
        const calls: number[] = []

        class System {
            node: ArborNode

            constructor() {
                this.node = new ArborNode(tree, this)
            }

            @invoke('update')
            onUpdate(dt: number): void {
                calls.push(dt)
            }
        }

        const sys = new System()
        tree.commit()

        tree.__invokeHooksDispatch('update', 1)
        expect(calls).toEqual([1])

        await sys.node.dispose()

        tree.__invokeHooksDispatch('update', 2)
        expect(calls).toEqual([1]) // no new call
    })

    it('should call hooks for multiple hosts', () => {
        const callsA: number[] = []
        const callsB: number[] = []

        class SystemA {
            node: ArborNode
            constructor() {
                this.node = new ArborNode(tree, this)
            }
            @invoke('update')
            onUpdate(dt: number): void {
                callsA.push(dt)
            }
        }

        class SystemB {
            node: ArborNode
            constructor() {
                this.node = new ArborNode(tree, this)
            }
            @invoke('update')
            onUpdate(dt: number): void {
                callsB.push(dt)
            }
        }

        new SystemA()
        new SystemB()
        tree.commit()

        tree.__invokeHooksDispatch('update', 0.5)
        expect(callsA).toEqual([0.5])
        expect(callsB).toEqual([0.5])
    })

    it('should integrate with registerUpdateEvents', () => {
        const rafCallbacks: FrameRequestCallback[] = []
        const rafMock = vi.fn((cb: FrameRequestCallback) => {
            rafCallbacks.push(cb)
            return rafCallbacks.length
        })
        const perfNow = vi.fn(() => 1000)

        Object.assign(globalThis, {
            requestAnimationFrame: rafMock,
            performance: { now: perfNow },
        })

        const calls: number[] = []

        class System {
            node: ArborNode
            constructor() {
                this.node = new ArborNode(tree, this)
            }
            @invoke('update')
            tick(dt: number): void {
                calls.push(dt)
            }
        }

        new System()
        tree.commit()
        tree.registerUpdateEvents()

        // Simulate RAF callback
        expect(rafCallbacks.length).toBe(1)
        perfNow.mockReturnValueOnce(1016)
        rafCallbacks[0]!(1016)

        expect(calls.length).toBe(1)
        expect(calls[0]).toBe(0.016)
    })

    it('should integrate with registerRenderEvents', () => {
        const rafCallbacks: FrameRequestCallback[] = []
        const rafMock = vi.fn((cb: FrameRequestCallback) => {
            rafCallbacks.push(cb)
            return rafCallbacks.length
        })

        Object.assign(globalThis, {
            requestAnimationFrame: rafMock,
        })

        const calls: string[] = []

        class System {
            node: ArborNode
            constructor() {
                this.node = new ArborNode(tree, this)
            }
            @invoke('render')
            draw(): void {
                calls.push('render')
            }
        }

        new System()
        tree.commit()
        tree.registerRenderEvents()

        expect(rafCallbacks.length).toBe(1)
        rafCallbacks[0]!(0)

        expect(calls).toEqual(['render'])
    })
})
