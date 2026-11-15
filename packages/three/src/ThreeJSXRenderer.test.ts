/**
 * Tests for ThreeJSXRenderer.
 */

import { describe, expect, test } from 'vitest'
import * as Three from 'three'

import { ThreeJSXRenderer } from './ThreeJSXRenderer'

describe('ThreeJSXRenderer', () => {
    test('creates renderer', () => {
        const renderer = new ThreeJSXRenderer()
        expect(renderer.scene).toBeInstanceOf(Three.Scene)
        expect(renderer.camera).toBeInstanceOf(Three.PerspectiveCamera)
    })

    test('renders scene with mesh', () => {
        const renderer = new ThreeJSXRenderer()

        renderer.render({
            type: 'scene',
            props: { background: 0x111111 },
            children: [
                {
                    type: 'mesh',
                    props: { position: [0, 0, 0] },
                    children: [
                        { type: 'boxGeometry', props: { args: [1, 1, 1] } },
                        { type: 'meshStandardMaterial', props: { color: 0x00ff00 } },
                    ],
                },
            ],
        })

        expect(renderer.scene.children.length).toBeGreaterThan(0)
    })

    test('renders lights', () => {
        const renderer = new ThreeJSXRenderer()

        renderer.render({
            type: 'scene',
            props: {},
            children: [
                { type: 'ambientLight', props: { intensity: 0.5 } },
                { type: 'directionalLight', props: { position: [5, 5, 5] } },
            ],
        })

        const hasAmbient = renderer.scene.children.some((child) => child instanceof Three.AmbientLight)
        const hasDirectional = renderer.scene.children.some((child) => child instanceof Three.DirectionalLight)

        expect(hasAmbient).toBe(true)
        expect(hasDirectional).toBe(true)
    })

    test('clears previous scene on render', () => {
        const renderer = new ThreeJSXRenderer()

        renderer.render({
            type: 'scene',
            props: {},
            children: [{ type: 'ambientLight', props: {} }],
        })

        const firstCount = renderer.scene.children.length

        renderer.render({
            type: 'scene',
            props: {},
            children: [{ type: 'pointLight', props: {} }],
        })

        expect(renderer.scene.children.length).toBe(firstCount)
        expect(renderer.scene.children[0]).toBeInstanceOf(Three.PointLight)
    })
})
