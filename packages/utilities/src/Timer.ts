/**
 * Timer — basic timer for measuring time intervals and logging performance.
 */

const timersAllow: Record<string, boolean> = {}

/**
 * @global
 * Base class for all timer implementations.
 */
export abstract class TimerBase {
    /**
     * Enable timer with the specified label.
     */
    static on(label: string): void {
        delete timersAllow[label]
    }

    /**
     * Disable timer with the specified label.
     */
    static off(label: string): void {
        timersAllow[label] = false
    }

    protected _time: number = Date.now()
    protected _label: string

    constructor(label?: string) {
        this._label = label ?? ''
    }

    get label(): string {
        return this._label
    }

    /**
     * @global
     * Reset timer.
     *
     * @returns This instance.
     */
    reset(): this {
        this._time = Date.now()
        return this
    }

    /**
     * @global
     * Check if timer is on.
     *
     * @param label - Optional label to check.
     * @returns true if timer is on.
     */
    isOn(label?: string): boolean {
        if (!label) {
            return timersAllow[this._label] !== false
        }

        const parts = label.split(':')
        let partLabel = this._label

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            partLabel += `: ${part}`

            if (timersAllow[partLabel] === false) {
                return false
            }
        }

        return true
    }
}

/**
 * Basic timer for measuring time intervals.
 */
export class Timer extends TimerBase {
    /**
     * Get milliseconds elapsed since last call to deltaTime() or creation.
     */
    deltaTime(): number {
        const dt = Date.now() - this._time
        this._time += dt
        return dt
    }

    /**
     * Log elapsed time with optional label.
     */
    log(label?: string): void {
        if (!this.isOn(label)) {
            return
        }

        const prefix = this._label ? `${this._label}${label ? `: ${label}` : ''}` : (label ?? '')

        console.log(`${prefix}: ${this.deltaTime()}ms`)
    }

    /**
     * Trace elapsed time with optional label.
     */
    trace(label?: string): void {
        if (!this.isOn(label)) {
            return
        }

        const prefix = this._label ? `${this._label}${label ? `: ${label}` : ''}` : (label ?? '')

        console.trace(`${prefix}: ${this.deltaTime()}ms`)
    }
}

/**
 * Timer that checks if a specified timeout period has elapsed.
 */
export class TimeoutTimer extends Timer {
    /**
     * Check if the specified timeout has elapsed.
     * If passed, advances internal timer by timeout amount.
     */
    timeout(ms: number): boolean {
        if (Date.now() - this._time > ms) {
            this._time += ms
            return true
        }

        return false
    }
}

/**
 * Timer that fires at regular intervals.
 */
export class IntervalTimer extends Timer {
    private _intervalStarted: boolean = false

    /**
     * Check if the specified interval has elapsed.
     */
    interval(ms: number, parameters?: { skipFirstTime?: boolean }): boolean {
        if (!this._intervalStarted) {
            this._intervalStarted = true

            if (parameters?.skipFirstTime) {
                return false
            }

            return true
        }

        if (Date.now() - this._time > ms) {
            this._time += ms
            return true
        }

        return false
    }

    reset(): this {
        super.reset()
        this._intervalStarted = false
        return this
    }
}

/**
 * Timer with execution delay compensation.
 */
export class WaitTimer extends TimerBase {
    private _extraMs: number = 0

    constructor(label?: string, timer?: WaitTimer) {
        super(label)

        if (timer != null) {
            this._extraMs = timer._extraMs
        }
    }

    /**
     * Wait for specified time with compensation for execution delays.
     */
    async wait(ms: number): Promise<void> {
        this._updateExtra()
        this._extraMs = Math.min(this._extraMs, ms)
        const waitMs = Math.max(0, ms - this._extraMs)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        this._extraMs -= ms
    }

    private _updateExtra(): void {
        const newTime = Date.now()
        this._extraMs += newTime - this._time
        this._time = newTime
    }
}
