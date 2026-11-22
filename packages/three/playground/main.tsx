import { createSignal, For, Show } from '@sky-modules/jsx'
import { mountThree } from '@sky-modules/three'
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

const ORBITERS = 5
const ORBIT_RADIUS = 3
const BACKGROUND = 0x111111

const container = document.getElementById('app')
if (!container) throw new Error('Missing element #app')

const scene = new Scene()
scene.background = new Color(BACKGROUND)
const camera = new PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
camera.position.set(5, 4, 6)
camera.lookAt(0, 0, 0)

const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(container.clientWidth, container.clientHeight)
container.append(renderer.domElement)

// One signal drives rotation, colors and the orbiters; JSX updates only the bound properties
const [time, setTime] = createSignal(0)
const [showOrbiters, setShowOrbiters] = createSignal(true)

mountThree(
    () => (
        <group>
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 5, 2]} intensity={1.2} />
            <mesh rotation={[time(), time() * 0.7, 0]}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color={new Color().setHSL((time() * 0.05) % 1, 0.7, 0.55)} roughness={0.4} />
            </mesh>
            <Show when={showOrbiters()}>
                <For each={Array.from({ length: ORBITERS }, (_, index) => index)}>
                    {(index) => {
                        const angle = (): number => time() + (index / ORBITERS) * Math.PI * 2
                        return (
                            <mesh position={[Math.cos(angle()) * ORBIT_RADIUS, 0, Math.sin(angle()) * ORBIT_RADIUS]}>
                                <sphereGeometry args={[0.3, 24, 16]} />
                                <meshStandardMaterial color={0xf59e0b} />
                            </mesh>
                        )
                    }}
                </For>
            </Show>
        </group>
    ),
    scene
)

container.addEventListener('click', () => setShowOrbiters((value) => !value))

function frame(now: number): void {
    setTime(now / 1000)
    renderer.render(scene, camera)
    requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
