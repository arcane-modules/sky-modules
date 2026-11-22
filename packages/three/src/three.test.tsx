import { createSignal, flush, Show } from 'solid-js'
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Scene, type SphereGeometry } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { mountThree, type ThreeNode } from './index'

function onlyChild<T>(parent: { children: unknown[] }, type: new (...args: never[]) => T): T {
    const [child] = parent.children
    if (!(child instanceof type)) throw new Error(`expected ${type.name}`)
    return child
}

describe('mountThree', () => {
    it('builds the object hierarchy with geometry and material', () => {
        const scene = new Scene()
        mountThree(
            () => (
                <group position={[1, 2, 3]}>
                    <mesh scale={2}>
                        <boxGeometry args={[1, 2, 3]} />
                        <meshStandardMaterial color={0xff0000} roughness={0.4} />
                    </mesh>
                </group>
            ),
            scene
        )
        flush()

        const group = onlyChild(scene, Group)
        const mesh = onlyChild(group, Mesh)
        expect(group.position.toArray()).toEqual([1, 2, 3])
        expect(mesh.scale.toArray()).toEqual([2, 2, 2])
        expect(mesh.geometry).toBeInstanceOf(BoxGeometry)
        expect((mesh.geometry as BoxGeometry).parameters.height).toBe(2)
        expect(mesh.material).toBeInstanceOf(MeshStandardMaterial)
        expect((mesh.material as MeshStandardMaterial).color.getHex()).toBe(0xff0000)
        expect((mesh.material as MeshStandardMaterial).roughness).toBe(0.4)
    })

    it('updates reactive position, rotation and color after flush', () => {
        const scene = new Scene()
        const [x, setX] = createSignal(0)
        const [color, setColor] = createSignal(0x00ff00)
        mountThree(
            () => (
                <mesh position={[x(), 0, 0]} rotation={[0, x(), 0]}>
                    <meshBasicMaterial color={color()} />
                </mesh>
            ),
            scene
        )
        flush()
        const mesh = onlyChild(scene, Mesh)

        setX(1.5)
        setColor(0x0000ff)
        flush()

        expect(mesh.position.x).toBe(1.5)
        expect(mesh.rotation.y).toBe(1.5)
        expect((mesh.material as MeshStandardMaterial).color.getHex()).toBe(0x0000ff)
    })

    it('recreates the geometry when args change and disposes the old one', () => {
        const scene = new Scene()
        const [radius, setRadius] = createSignal(1)
        mountThree(
            () => (
                <mesh>
                    <sphereGeometry args={[radius(), 8, 6]} />
                </mesh>
            ),
            scene
        )
        flush()
        const mesh = onlyChild(scene, Mesh)
        const first = mesh.geometry
        const dispose = vi.spyOn(first, 'dispose')

        setRadius(3)
        flush()

        expect(mesh.geometry).not.toBe(first)
        expect((mesh.geometry as SphereGeometry).parameters.radius).toBe(3)
        expect(dispose).toHaveBeenCalledOnce()
    })

    it('removes objects hidden by Show and disposes their resources', () => {
        const scene = new Scene()
        const [visible, setVisible] = createSignal(true)
        let material: MeshStandardMaterial | undefined
        mountThree(
            () => (
                <group>
                    <Show when={visible()}>
                        <mesh>
                            <boxGeometry />
                            <meshStandardMaterial
                                ref={(node: ThreeNode<MeshStandardMaterial>) => {
                                    material = node.object
                                }}
                            />
                        </mesh>
                    </Show>
                </group>
            ),
            scene
        )
        flush()
        const group = onlyChild(scene, Group)
        expect(group.children).toHaveLength(1)
        if (material === undefined) throw new Error('expected the material ref')
        const disposeMaterial = vi.spyOn(material, 'dispose')

        setVisible(false)
        flush()

        expect(group.children).toHaveLength(0)
        expect(disposeMaterial).toHaveBeenCalledOnce()
    })

    it('clears the parent on dispose', () => {
        const scene = new Scene()
        const dispose = mountThree(
            () => (
                <group>
                    <mesh />
                </group>
            ),
            scene
        )
        flush()

        dispose()

        expect(scene.children).toEqual([])
    })

    it('accepts compatible vector objects from another math instance', () => {
        const scene = new Scene()
        // Plain structural objects stand in for @sky-modules/math or a second three.js copy
        mountThree(() => <mesh position={{ x: 1, y: 2, z: 3 }} rotation={{ x: 0, y: 1, z: 0, order: 'XYZ' }} />, scene)
        flush()

        const mesh = onlyChild(scene, Mesh)
        expect(mesh.position.toArray()).toEqual([1, 2, 3])
        expect(mesh.rotation.y).toBe(1)
    })

    it('recompiles a material only for program-changing fields', () => {
        const scene = new Scene()
        const [opacity, setOpacity] = createSignal(1)
        const [color, setColor] = createSignal(0xff0000)
        const [transparent, setTransparent] = createSignal(false)
        mountThree(
            () => (
                <mesh>
                    <meshBasicMaterial color={color()} opacity={opacity()} transparent={transparent()} />
                </mesh>
            ),
            scene
        )
        flush()
        const material = onlyChild(scene, Mesh).material as MeshStandardMaterial
        const version = material.version

        setOpacity(0.5)
        setColor(0x00ff00)
        flush()
        expect(material.version).toBe(version)

        setTransparent(true)
        flush()
        expect(material.version).toBeGreaterThan(version)
    })

    it('rejects args on objects', () => {
        const scene = new Scene()
        expect(() => mountThree(() => <group args={[]} />, scene)).toThrow(/"args" is not supported on <group>/)
    })
})
