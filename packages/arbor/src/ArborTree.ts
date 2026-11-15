import ArborBase from './internal/ArborBase'
import { processCommit } from './internal/operations'
import type { ParentOperation, DependencyOperation, ContextOperation } from './internal/operations'

/**
 * Root of an Arbor tree.
 *
 * Serves as the root for ownership, context propagation, and event dispatch.
 * Manages operation queues for deferred structural changes.
 * Provides browser IO hooks (update, mouse, keyboard, gamepad, resize).
 *
 * Only ArborTree can exist without a parent.
 */
export default class ArborTree extends ArborBase {
    // ── Identity ────────────────────────────────────────────────────────────

    readonly isArborTree = true as const

    /**
     * ArborTree returns itself as its own root.
     */
    get root(): ArborTree {
        return this
    }

    // ── Input state ─────────────────────────────────────────────────────────

    isLeftMousePressed = false
    isMiddleMousePressed = false
    isRightMousePressed = false
    isPressed: Record<string, boolean> = {}
    isPointerEventCaptured = false
    gamepadStates: Record<number, Gamepad> = {}
    gamepadButtonPressed: Record<string, boolean> = {}
    /** @internal Gamepad polling RAF id */
    gamepadPollingFrameId: number | null = null

    // ── Invoke hooks registry ───────────────────────────────────────────────

    private __invokeHooks: Map<string, Set<(...args: unknown[]) => void>> = new Map()

    /**
     * Registers an invoke hook callback for the given hook name.
     * Returns an unsubscribe function.
     * @internal
     */
    __registerInvokeHook(name: string, fn: (...args: unknown[]) => void): () => void {
        if (!this.__invokeHooks.has(name)) {
            this.__invokeHooks.set(name, new Set())
        }
        const set = this.__invokeHooks.get(name)!
        set.add(fn)
        return (): void => {
            set.delete(fn)
        }
    }

    /**
     * Dispatches to all registered invoke hooks for the given name.
     * @internal
     */
    __invokeHooksDispatch(name: string, ...args: unknown[]): void {
        const hooks = this.__invokeHooks.get(name)
        if (!hooks) return
        for (const fn of hooks) {
            fn(...args)
        }
    }

    // ── Operation queues (internal, accessed by operations.ts) ──────────────

    /** @internal */
    __pendingAddParentOperations: ParentOperation[] = []
    /** @internal */
    __pendingRemoveParentOperations: ParentOperation[] = []
    /** @internal */
    __pendingAddDependencyOperations: DependencyOperation[] = []
    /** @internal */
    __pendingRemoveDependencyOperations: DependencyOperation[] = []
    /** @internal */
    __pendingAddContextOperations: ContextOperation[] = []
    /** @internal */
    __pendingRemoveContextOperations: ContextOperation[] = []

    // ── Gamepad helpers ─────────────────────────────────────────────────────

    getGamepad(index = 0): Gamepad | null {
        return this.gamepadStates[index] || null
    }

    isGamepadButtonPressed(gamepadIndex: number, buttonIndex: number): boolean {
        const key = `gamepad-${gamepadIndex}-button-${buttonIndex}`
        return this.gamepadButtonPressed[key] || false
    }

    // ── Commit ──────────────────────────────────────────────────────────────

    /**
     * Processes all pending operations (parent/child relationships,
     * dependencies, contexts) in the correct order.
     *
     * Queues are cleared after processing.
     */
    commit(): void {
        processCommit(this as unknown as ArborTree & Record<string, unknown>)
    }

    // ── Update events ───────────────────────────────────────────────────────

    /**
     * Registers update event handlers that run on every frame.
     * Emits beforeUpdate, update, afterUpdate events.
     */
    registerUpdateEvents({ before, after }: { before?: null | (() => void); after?: null | (() => void) } = {}): this {
        const loop = (dt: number): void => {
            this.__invokeHooksDispatch('update', dt)
            before?.()
            this.dispatch('onBeforeUpdate', { dt })
            this.dispatch('onUpdate', { dt })
            this.dispatch('onAfterUpdate', { dt })
            after?.()
        }

        if (typeof requestAnimationFrame !== 'undefined') {
            let running = true
            let prevTime = performance.now()

            const frame = (time: number): void => {
                if (!running) return
                const dt = (time - prevTime) / 1000
                prevTime = time
                loop(dt)
                requestAnimationFrame(frame)
            }

            requestAnimationFrame(frame)

            // Cleanup on dispose
            const origDispose = this.dispose
            this.dispose = async (): Promise<void> => {
                running = false
                await origDispose.call(this)
            }
        }

        return this
    }

    // ── Mouse events ────────────────────────────────────────────────────────

    /**
     * Registers global mouse event handlers.
     */
    registerMouseEvents({
        before,
        after,
    }: {
        before?: (x: number, y: number) => [number, number]
        after?: (x: number, y: number) => void
    } = {}): this {
        if (typeof window === 'undefined') {
            return this
        }

        const listeners: [string, EventListener][] = []

        const onMouseMove = (ev: Event): void => {
            const me = ev as MouseEvent
            let x = me.clientX
            let y = me.clientY
            if (before) {
                const result = before(x, y)
                x = result[0]
                y = result[1]
            }
            this.dispatchReverse('onGlobalMouseMove', { x, y })
            after?.(x, y)
        }

        const onMouseDown = (ev: Event): void => {
            const me = ev as MouseEvent
            if (me.button === 0) this.isLeftMousePressed = true
            else if (me.button === 1) this.isMiddleMousePressed = true
            else if (me.button === 2) this.isRightMousePressed = true

            let x = me.clientX
            let y = me.clientY
            if (before) {
                const result = before(x, y)
                x = result[0]
                y = result[1]
            }
            this.dispatchReverse('onGlobalMouseDown', { x, y, button: me.button })
            after?.(x, y)
        }

        const onMouseUp = (ev: Event): void => {
            const me = ev as MouseEvent
            if (me.button === 0) this.isLeftMousePressed = false
            else if (me.button === 1) this.isMiddleMousePressed = false
            else if (me.button === 2) this.isRightMousePressed = false

            let x = me.clientX
            let y = me.clientY
            if (before) {
                const result = before(x, y)
                x = result[0]
                y = result[1]
            }
            this.dispatchReverse('onGlobalMouseUp', { x, y })
            after?.(x, y)
        }

        const onClick = (ev: Event): void => {
            const me = ev as MouseEvent
            let x = me.clientX
            let y = me.clientY
            if (before) {
                const result = before(x, y)
                x = result[0]
                y = result[1]
            }
            this.dispatchReverse('onGlobalClick', { x, y })
            after?.(x, y)
        }

        const onWheel = (ev: Event): void => {
            const we = ev as WheelEvent
            this.dispatchReverse('onGlobalScroll', {
                x: we.deltaX,
                y: we.deltaY,
                z: we.deltaZ,
            })
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('click', onClick)
        window.addEventListener('wheel', onWheel, { passive: true })

        listeners.push(['mousemove', onMouseMove])
        listeners.push(['mousedown', onMouseDown])
        listeners.push(['mouseup', onMouseUp])
        listeners.push(['click', onClick])
        listeners.push(['wheel', onWheel])

        // Cleanup on dispose
        const origDispose = this.dispose
        this.dispose = async (): Promise<void> => {
            for (const [event, handler] of listeners) {
                window.removeEventListener(event, handler)
            }
            await origDispose.call(this)
        }

        return this
    }

    // ── Keyboard events ─────────────────────────────────────────────────────

    /**
     * Registers global keyboard event handlers.
     */
    registerEmitKeyboardEvents(before?: () => void, after?: () => void): this {
        if (typeof window === 'undefined') {
            return this
        }

        const listeners: [string, EventListener][] = []

        const onKeyDown = (ev: Event): void => {
            const ke = ev as KeyboardEvent
            this.isPressed[ke.code] = true
            before?.()
            this.dispatch('onGlobalKeyDown', { code: ke.code })
            after?.()
        }

        const onKeyUp = (ev: Event): void => {
            const ke = ev as KeyboardEvent
            delete this.isPressed[ke.code]
            before?.()
            this.dispatch('onGlobalKeyUp', { code: ke.code })
            after?.()
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        listeners.push(['keydown', onKeyDown])
        listeners.push(['keyup', onKeyUp])

        const origDispose = this.dispose
        this.dispose = async (): Promise<void> => {
            for (const [event, handler] of listeners) {
                window.removeEventListener(event, handler)
            }
            await origDispose.call(this)
        }

        return this
    }

    // ── Gamepad events ──────────────────────────────────────────────────────

    /**
     * Registers gamepad event handlers.
     */
    registerGamepadEvents({ before, after }: { before?: () => void; after?: () => void } = {}): this {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return this
        }

        // Gamepad connection
        const onConnected = (ev: Event): void => {
            const ge = ev as GamepadEvent
            this.gamepadStates[ge.gamepad.index] = ge.gamepad
            this.dispatch('onGamepadConnected', { gamepad: ge.gamepad })
        }

        const onDisconnected = (ev: Event): void => {
            const ge = ev as GamepadEvent
            delete this.gamepadStates[ge.gamepad.index]
            this.dispatch('onGamepadDisconnected', { gamepad: ge.gamepad })
        }

        window.addEventListener('gamepadconnected', onConnected)
        window.addEventListener('gamepaddisconnected', onDisconnected)

        // Polling loop
        const poll = (): void => {
            if (this.disposed) return

            try {
                this.__pollGamepads(before, after)
            } finally {
                // Keep polling even if a user callback throws
                if (!this.disposed) {
                    this.gamepadPollingFrameId = requestAnimationFrame(poll)
                }
            }
        }

        this.gamepadPollingFrameId = requestAnimationFrame(poll)

        // Cleanup on dispose
        const origDispose = this.dispose
        this.dispose = async (): Promise<void> => {
            this.stopGamepadPolling()
            window.removeEventListener('gamepadconnected', onConnected)
            window.removeEventListener('gamepaddisconnected', onDisconnected)
            await origDispose.call(this)
        }

        return this
    }

    /**
     * Runs one gamepad polling step.
     * @internal
     */
    private __pollGamepads(before?: () => void, after?: () => void): void {
        before?.()

        const gamepads = navigator.getGamepads()
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i]
            if (!gp) continue

            this.gamepadStates[gp.index] = gp

            for (let b = 0; b < gp.buttons.length; b++) {
                const button = gp.buttons[b]!
                const key = `gamepad-${gp.index}-button-${b}`
                const wasPressed = this.gamepadButtonPressed[key] ?? false
                const isPressedNow = button.pressed

                if (isPressedNow && !wasPressed) {
                    this.gamepadButtonPressed[key] = true
                    this.dispatch('onGamepadButtonDown', {
                        gamepadIndex: gp.index,
                        buttonIndex: b,
                        value: button.value,
                    })
                } else if (!isPressedNow && wasPressed) {
                    this.gamepadButtonPressed[key] = false
                    this.dispatch('onGamepadButtonUp', {
                        gamepadIndex: gp.index,
                        buttonIndex: b,
                        value: button.value,
                    })
                }
            }

            this.dispatch('onGamepadAxisMove', {
                gamepadIndex: gp.index,
                axes: gp.axes,
                leftStick: { x: gp.axes[0] ?? 0, y: gp.axes[1] ?? 0 },
                rightStick: { x: gp.axes[2] ?? 0, y: gp.axes[3] ?? 0 },
            })
        }

        after?.()
    }

    /**
     * Stops the gamepad polling loop.
     */
    stopGamepadPolling(): void {
        if (this.gamepadPollingFrameId !== null) {
            cancelAnimationFrame(this.gamepadPollingFrameId)
            this.gamepadPollingFrameId = null
        }
    }

    // ── Render events ───────────────────────────────────────────────────────

    /**
     * Registers render event handlers that run on every animation frame.
     * Emits beforeRender, render, afterRender events.
     */
    registerRenderEvents({ before, after }: { before?: () => void; after?: () => void } = {}): this {
        if (typeof requestAnimationFrame !== 'undefined') {
            let running = true

            const frame = (): void => {
                if (!running) return
                before?.()
                this.__invokeHooksDispatch('render', {})
                this.dispatch('onBeforeRender', {})
                this.dispatch('onRender', {})
                this.dispatch('onAfterRender', {})
                after?.()
                requestAnimationFrame(frame)
            }

            requestAnimationFrame(frame)

            const origDispose = this.dispose
            this.dispose = async (): Promise<void> => {
                running = false
                await origDispose.call(this)
            }
        }

        return this
    }

    // ── Window resize ───────────────────────────────────────────────────────

    /**
     * Registers window resize event handler.
     * Calls the callback immediately with current dimensions.
     */
    registerEmitWindowResize({ resize }: { resize: (w: number, h: number) => void }): this {
        if (typeof window === 'undefined') {
            return this
        }

        const dims = { width: window.innerWidth, height: window.innerHeight }
        resize(dims.width, dims.height)
        this.__invokeHooksDispatch('resize', dims)

        const onResize = (): void => {
            const d = { width: window.innerWidth, height: window.innerHeight }
            resize(d.width, d.height)
            this.__invokeHooksDispatch('resize', d)
        }

        window.addEventListener('resize', onResize)

        const origDispose = this.dispose
        this.dispose = async (): Promise<void> => {
            window.removeEventListener('resize', onResize)
            await origDispose.call(this)
        }

        return this
    }
}
