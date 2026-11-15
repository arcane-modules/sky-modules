import { beforeEach, describe, expect, it } from 'vitest'
import ArborTree from '../ArborTree'
import ArborNode from '../ArborNode'
import type { ArborContextClass } from '../types'

describe('ArborTree', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
    })

    it('should be identified as ArborTree', () => {
        expect(tree.isArborTree).toBe(true)
    })

    it('should return itself as root', () => {
        expect(tree.root).toBe(tree)
    })

    it('should initialize mouse state', () => {
        expect(tree.isLeftMousePressed).toBe(false)
        expect(tree.isMiddleMousePressed).toBe(false)
        expect(tree.isRightMousePressed).toBe(false)
    })

    it('should commit without error', () => {
        expect(() => tree.commit()).not.toThrow()
    })

    it('should clear queues after commit', () => {
        new ArborNode(tree)
        expect(tree['__pendingAddParentOperations']).toHaveLength(1)
        tree.commit()
        expect(tree['__pendingAddParentOperations']).toHaveLength(0)
    })

    it('should be reusable after commit', () => {
        tree.commit()

        new ArborNode(tree)
        tree.commit()
    })

    it('should dispose cleanly', async () => {
        await tree.dispose()
        expect(tree.disposed).toBe(true)
    })

    it('should get gamepad by index', () => {
        expect(tree.getGamepad(0)).toBeNull()
        const mock = { index: 0 } as Gamepad
        tree.gamepadStates[0] = mock
        expect(tree.getGamepad(0)).toBe(mock)
        expect(tree.getGamepad()).toBe(mock)
        expect(tree.getGamepad(1)).toBeNull()
    })

    it('should track gamepad button state', () => {
        expect(tree.isGamepadButtonPressed(0, 0)).toBe(false)
        tree.gamepadButtonPressed['gamepad-0-button-0'] = true
        expect(tree.isGamepadButtonPressed(0, 0)).toBe(true)
    })

    it('should add context and propagate to children', () => {
        class AppConfig {
            static context = true as const
            value = 'app'
        }

        tree.addContext(new AppConfig())
        const child = new ArborNode(tree)
        tree.commit()

        const Ctx = AppConfig as unknown as ArborContextClass
        expect(child.hasContext(Ctx)).toBe(true)
        expect(child.context(Ctx).value).toBe('app')
    })
})
