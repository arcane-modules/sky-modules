import { ThreeJSXRenderer } from '@sky-modules/three'

const container = document.getElementById('app')
if (!container) throw new Error('Missing element #app')

const renderer = new ThreeJSXRenderer(container)
renderer.renderer?.setSize(container.clientWidth, container.clientHeight)
const aspect = container.clientWidth / container.clientHeight

function frame(time: number): void {
    const angle = time / 1000

    renderer.render({
        type: 'scene',
        props: { background: 0x111111 },
        children: [
            { type: 'camera', props: { aspect, position: [5, 4, 6], lookAt: [0, 0, 0] }, children: [] },
            { type: 'ambientLight', props: { intensity: 0.5 }, children: [] },
            { type: 'directionalLight', props: { position: [3, 5, 2], intensity: 1.2 }, children: [] },
            {
                type: 'mesh',
                props: { rotation: [angle, angle * 0.7, 0] },
                children: [
                    { type: 'boxGeometry', props: { args: [1.5, 1.5, 1.5] } },
                    { type: 'meshStandardMaterial', props: { color: 0x3b82f6, roughness: 0.4 } },
                ],
            },
            {
                type: 'mesh',
                props: { position: [Math.cos(angle) * 3, 0, Math.sin(angle) * 3] },
                children: [
                    { type: 'sphereGeometry', props: { args: [0.4, 24, 16] } },
                    { type: 'meshStandardMaterial', props: { color: 0xf59e0b } },
                ],
            },
        ],
    })

    requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
