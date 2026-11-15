import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArborTree from '../ArborTree'

describe('IO', () => {
    let tree: ArborTree

    beforeEach(() => {
        tree = new ArborTree()
    })

    describe('mouse events', () => {
        it('should register mouse event handlers', () => {
            // In node environment, window is undefined
            // registerMouseEvents should return early safely
            const result = tree.registerMouseEvents({})
            expect(result).toBe(tree)
        })

        it('should not crash without window', () => {
            const originalWindow = globalThis.window
            delete (globalThis as Record<string, unknown>).window
            const result = tree.registerMouseEvents({})
            expect(result).toBe(tree)
            ;(globalThis as Record<string, unknown>).window = originalWindow
        })
    })

    describe('keyboard events', () => {
        it('should register keyboard event handlers', () => {
            const result = tree.registerEmitKeyboardEvents()
            expect(result).toBe(tree)
        })

        it('should not crash without window', () => {
            const originalWindow = globalThis.window
            delete (globalThis as Record<string, unknown>).window
            const result = tree.registerEmitKeyboardEvents()
            expect(result).toBe(tree)
            ;(globalThis as Record<string, unknown>).window = originalWindow
        })
    })

    describe('update events', () => {
        it('should register update events without error', () => {
            const result = tree.registerUpdateEvents({})
            expect(result).toBe(tree)
        })
    })

    describe('gamepad events', () => {
        it('should register gamepad events without error', () => {
            const result = tree.registerGamepadEvents()
            expect(result).toBe(tree)
        })

        it('should not crash without window', () => {
            const originalWindow = globalThis.window
            delete (globalThis as Record<string, unknown>).window
            const result = tree.registerGamepadEvents()
            expect(result).toBe(tree)
            ;(globalThis as Record<string, unknown>).window = originalWindow
        })
    })

    describe('render events', () => {
        it('should register render events without error', () => {
            const result = tree.registerRenderEvents()
            expect(result).toBe(tree)
        })
    })

    describe('window resize', () => {
        it('should register resize without crashing', () => {
            const resize = vi.fn()
            const result = tree.registerEmitWindowResize({ resize })
            expect(result).toBe(tree)
        })

        it('should not crash without window', () => {
            const resize = vi.fn()
            const originalWindow = globalThis.window
            delete (globalThis as Record<string, unknown>).window
            const result = tree.registerEmitWindowResize({ resize })
            expect(result).toBe(tree)
            ;(globalThis as Record<string, unknown>).window = originalWindow
        })
    })

    describe('input state', () => {
        it('should track mouse button state', () => {
            expect(tree.isLeftMousePressed).toBe(false)
            expect(tree.isMiddleMousePressed).toBe(false)
            expect(tree.isRightMousePressed).toBe(false)
        })

        it('should track keyboard state', () => {
            expect(tree.isPressed).toEqual({})
        })

        it('should track gamepad state', () => {
            expect(tree.gamepadStates).toEqual({})
            expect(tree.gamepadButtonPressed).toEqual({})
        })
    })

    describe('cleanup on dispose', () => {
        it('should stop gamepad polling on dispose when registered', async () => {
            const origRAF = globalThis.requestAnimationFrame
            const origCAF = globalThis.cancelAnimationFrame
            const origNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
            const origWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')

            const rafMock = vi.fn(() => {
                return 123
            })
            const cafMock = vi.fn()

            Object.defineProperty(globalThis, 'window', {
                value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
                writable: true,
                configurable: true,
            })
            Object.defineProperty(globalThis, 'navigator', {
                value: { getGamepads: () => [] },
                writable: true,
                configurable: true,
            })
            globalThis.requestAnimationFrame = rafMock
            globalThis.cancelAnimationFrame = cafMock

            tree.registerGamepadEvents()
            expect(tree.gamepadPollingFrameId).toBe(123)

            await tree.dispose()

            expect(cafMock).toHaveBeenCalledWith(123)

            globalThis.requestAnimationFrame = origRAF
            globalThis.cancelAnimationFrame = origCAF
            if (origNav) {
                Object.defineProperty(globalThis, 'navigator', origNav)
            }
            if (origWindow) {
                Object.defineProperty(globalThis, 'window', origWindow)
            }
        })

        it('should complete dispose without error', async () => {
            await tree.dispose()
            expect(tree.disposed).toBe(true)
        })
    })
})
