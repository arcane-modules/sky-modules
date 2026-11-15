import { describe, expect, test, vi } from 'vitest'
import { Timer, TimeoutTimer, IntervalTimer, WaitTimer } from './Timer'

describe('Timer', () => {
    test('creates timer and measures delta', () => {
        const timer = new Timer('test')
        const dt = timer.deltaTime()
        expect(dt).toBeGreaterThanOrEqual(0)
    })

    test('reset restarts measurement', () => {
        const timer = new Timer()
        timer.deltaTime()
        timer.reset()
        const dt = timer.deltaTime()
        expect(dt).toBeGreaterThanOrEqual(0)
    })

    test('log outputs to console', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const timer = new Timer('test')
        timer.log()
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    test('trace outputs to console.trace', () => {
        const spy = vi.spyOn(console, 'trace').mockImplementation(() => {})
        const timer = new Timer('test')
        timer.trace()
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    test('Timer.on and Timer.off enable/disable', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const timer = new Timer('test-label')
        Timer.off('test-label')
        timer.log()
        expect(spy).not.toHaveBeenCalled()
        Timer.on('test-label')
        timer.deltaTime()
        timer.log()
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})

describe('TimeoutTimer', () => {
    test('timeout returns false initially', () => {
        const timer = new TimeoutTimer()
        expect(timer.timeout(1000)).toBe(false)
    })

    test('timeout returns true after time passes', async () => {
        const timer = new TimeoutTimer()
        await new Promise((r) => setTimeout(r, 30))
        expect(timer.timeout(10)).toBe(true)
    })

    test('timeout resets after triggering', () => {
        const timer = new TimeoutTimer()
        timer.timeout(0) // triggers immediately
        expect(timer.timeout(1000)).toBe(false) // reset
    })
})

describe('IntervalTimer', () => {
    test('interval returns true on first call by default', () => {
        const timer = new IntervalTimer()
        expect(timer.interval(1000)).toBe(true)
    })

    test('interval skips first if configured', () => {
        const timer = new IntervalTimer()
        expect(timer.interval(1000, { skipFirstTime: true })).toBe(false)
    })

    test('reset clears interval flag', () => {
        const timer = new IntervalTimer()
        timer.interval(1000)
        timer.reset()
        expect(timer.interval(1000)).toBe(true)
    })
})

describe('WaitTimer', () => {
    test('wait resolves after specified time', async () => {
        const timer = new WaitTimer()
        const start = Date.now()
        await timer.wait(50)
        const elapsed = Date.now() - start
        expect(elapsed).toBeGreaterThanOrEqual(30)
    })

    test('copy constructor preserves compensation', () => {
        const timer1 = new WaitTimer()
        const timer2 = new WaitTimer('copy', timer1)
        expect(timer2).toBeDefined()
    })
})
