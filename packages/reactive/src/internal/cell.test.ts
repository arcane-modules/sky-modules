import { createEffect, createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { signal } from '../lamps/signal'
import { createCell } from './cell'

describe('solid-js build under test', () => {
    it('is the client build where writes apply on flush', () => {
        const [read, write] = createSignal(1)
        write(2)

        expect(read()).toBe(1)
        flush()
        expect(read()).toBe(2)
    })
})

describe('createCell', () => {
    it('returns the written value immediately', () => {
        const cell = createCell(1)
        cell.write(2)

        expect(cell.read()).toBe(2)
        expect(cell.peek()).toBe(2)
    })

    it('stores functions as values, not computations', () => {
        const handler = (): string => 'called'
        const cell = createCell(handler)

        expect(cell.read()).toBe(handler)
    })

    it('notifies effects once per flush and skips equal writes', () => {
        const cell = createCell(0)
        const seen: unknown[] = []

        const dispose = createRoot((disposeRoot) => {
            createEffect(
                () => cell.read(),
                (value) => {
                    seen.push(value)
                }
            )
            return disposeRoot
        })
        flush()

        cell.write(1)
        cell.write(2)
        flush()
        cell.write(2)
        flush()
        dispose()

        expect(seen).toEqual([0, 2])
    })

    it('allows writes from inside an effect', () => {
        const source = createCell(1)
        const target = createCell(0)

        const dispose = createRoot((disposeRoot) => {
            createEffect(
                () => source.read(),
                (value) => {
                    target.write(Number(value) * 10)
                }
            )
            return disposeRoot
        })
        flush()
        dispose()

        expect(target.read()).toBe(10)
    })
})

describe('signal proxy', () => {
    it('reads a property right after writing it', () => {
        const state = signal({ health: 100 })
        state.health = 50

        expect(state.health).toBe(50)
    })
})
