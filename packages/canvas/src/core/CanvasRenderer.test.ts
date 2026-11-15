/**
 * Tests for CanvasRenderer and scene graph.
 */

import { describe, expect, test } from 'vitest'

import { CanvasRenderer } from './CanvasRenderer'
import { Mesh } from './Mesh'
import { Group } from './Group'
import { Scene } from './Scene'
import { RectGeometry } from '../geometries/RectGeometry'
import { CircleGeometry } from '../geometries/CircleGeometry'
import { BasicMaterial } from '../materials/BasicMaterial'
import { createCanvasObject } from '../jsx/canvas-renderer'

// Mock document and canvas for node environment
class MockContext {
    fillStyle = ''
    strokeStyle = ''
    lineWidth = 1
    canvas = { width: 0, height: 0 }

    save() {}
    restore() {}
    translate() {}
    rotate() {}
    scale() {}
    beginPath() {}
    closePath() {}
    rect() {}
    arc() {}
    fill() {}
    stroke() {}
    clearRect() {}
    fillRect() {}
    resetTransform() {}
    roundRect() {}
}

class MockCanvas {
    width = 0
    height = 0
    style = {} as CSSStyleDeclaration

    getContext() {
        return new MockContext() as unknown as CanvasRenderingContext2D
    }
}

describe('CanvasRenderer', () => {
    test('creates renderer with provided canvas', () => {
        const canvas = new MockCanvas() as unknown as HTMLCanvasElement
        const renderer = new CanvasRenderer({ canvas, size: () => [800, 600] })

        expect(renderer.domElement).toBe(canvas)
        expect(renderer.pixelRatio).toBe(1)
    })

    test('renders scene with background', () => {
        const canvas = new MockCanvas() as unknown as HTMLCanvasElement
        const renderer = new CanvasRenderer({ canvas, size: () => [100, 100] })
        const scene = new Scene()
        scene.background = '#ff0000'

        const result = renderer.render(scene)
        expect(result).toBe(renderer)
    })

    test('renders mesh', () => {
        const canvas = new MockCanvas() as unknown as HTMLCanvasElement
        const renderer = new CanvasRenderer({ canvas, size: () => [100, 100] })
        const scene = new Scene()
        const mesh = new Mesh(new RectGeometry({ width: 10, height: 10 }), new BasicMaterial({ color: '#00ff00' }))
        scene.add(mesh)

        renderer.render(scene)
        expect(mesh.geometry).toBeTruthy()
        expect(mesh.material).toBeTruthy()
    })
})

describe('Object2D scene graph', () => {
    test('group can contain children', () => {
        const group = new Group()
        const mesh = new Mesh(new CircleGeometry({ radius: 5 }), new BasicMaterial({ color: '#0000ff' }))

        group.add(mesh)
        expect(group.children).toContain(mesh)
        expect(mesh.parent).toBe(group)

        group.remove(mesh)
        expect(group.children).not.toContain(mesh)
    })
})

describe('createCanvasObject', () => {
    test('creates rect mesh from JSX', () => {
        const element = {
            type: 'rect' as const,
            props: { x: 10, y: 20, width: 100, height: 50, fill: '#ff0000' },
        } as never

        const object = createCanvasObject(element)
        expect(object).toBeInstanceOf(Mesh)
    })

    test('creates circle mesh from JSX', () => {
        const element = {
            type: 'circle' as const,
            props: { x: 10, y: 20, radius: 30, fill: '#0000ff' },
        } as never

        const object = createCanvasObject(element)
        expect(object).toBeInstanceOf(Mesh)
    })

    test('creates group with children', () => {
        const element = {
            type: 'group' as const,
            props: {
                x: 0,
                y: 0,
                children: [{ type: 'rect' as const, props: { width: 10, height: 10, fill: '#000' } }],
            },
        } as never

        const object = createCanvasObject(element)
        expect(object).toBeInstanceOf(Group)
        expect((object as Group).children).toHaveLength(1)
    })
})
