import { describe, expect, test } from 'vitest'
import { MockCanvasRenderingContext2D, MockHTMLCanvasElement } from './canvas'

describe('MockCanvasRenderingContext2D', () => {
    test('creates with default values', () => {
        const ctx = new MockCanvasRenderingContext2D()
        expect(ctx.fillStyle).toBe('#000000')
        expect(ctx.strokeStyle).toBe('#000000')
        expect(ctx.lineWidth).toBe(1)
        expect(ctx.font).toBe('10px sans-serif')
    })

    test('methods are callable spies', () => {
        const ctx = new MockCanvasRenderingContext2D()
        ctx.fillRect(10, 20, 100, 200)
        expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 100, 200)

        ctx.beginPath()
        expect(ctx.beginPath).toHaveBeenCalledOnce()
    })

    test('measureText returns mock width', () => {
        const ctx = new MockCanvasRenderingContext2D()
        const metrics = ctx.measureText('hello')
        expect(metrics.width).toBe(100)
    })

    test('createLinearGradient returns mock gradient', () => {
        const ctx = new MockCanvasRenderingContext2D()
        const gradient = ctx.createLinearGradient(0, 0, 100, 100)
        gradient.addColorStop(0, 'red')
        expect(gradient.addColorStop).toHaveBeenCalledWith(0, 'red')
    })
})

describe('MockHTMLCanvasElement', () => {
    test('creates with default dimensions', () => {
        const canvas = new MockHTMLCanvasElement()
        expect(canvas.width).toBe(300)
        expect(canvas.height).toBe(150)
    })

    test('getContext returns mock 2d context', () => {
        const canvas = new MockHTMLCanvasElement()
        const ctx = canvas.getContext('2d')
        expect(ctx).toBeInstanceOf(MockCanvasRenderingContext2D)
    })

    test('getContext returns null for unknown context', () => {
        const canvas = new MockHTMLCanvasElement()
        expect(canvas.getContext('webgl')).toBeNull()
    })

    test('getBoundingClientRect returns mock rect', () => {
        const canvas = new MockHTMLCanvasElement()
        const rect = canvas.getBoundingClientRect()
        expect(rect.width).toBe(300)
        expect(rect.height).toBe(150)
    })

    test('setAttribute and getAttribute work', () => {
        const canvas = new MockHTMLCanvasElement()
        canvas.setAttribute('data-test', 'value')
        expect(canvas.setAttribute).toHaveBeenCalledWith('data-test', 'value')
    })
})
