import {
    BasicMaterial,
    CanvasRenderer,
    CircleGeometry,
    FillStrokeMaterial,
    Group,
    Mesh,
    RectGeometry,
    Scene,
} from '@sky-modules/canvas'

const WIDTH = 480
const HEIGHT = 280

const stage = document.getElementById('stage')
if (!stage) throw new Error('Missing element #stage')

const scene = new Scene()
scene.background = '#111111'

const orbit = new Group()
orbit.x = WIDTH / 2
orbit.y = HEIGHT / 2

const box = new Mesh(
    new RectGeometry({ x: -40, y: -40, width: 80, height: 80, radius: 12 }),
    new FillStrokeMaterial({ fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 })
)

const moon = new Mesh(new CircleGeometry({ radius: 14 }), new BasicMaterial({ color: '#f59e0b' }))
moon.x = 100

orbit.add(box)
orbit.add(moon)
scene.add(orbit)

const renderer = new CanvasRenderer({ size: () => [WIDTH, HEIGHT], pixelRatio: window.devicePixelRatio })
stage.appendChild(renderer.domElement)

let previous = performance.now()

function frame(time: number): void {
    const delta = (time - previous) / 1000
    previous = time

    orbit.rotation += delta
    box.rotation -= delta * 2

    renderer.render(scene)
    requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
