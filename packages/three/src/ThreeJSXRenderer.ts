/**
 * Three.js JSX Renderer
 *
 * Provides JSX syntax support for Three.js 3D graphics via @sky-modules/jsx.
 *
 * @module
 */

import * as Three from 'three'

/** What a JSX element can be: a tag name or a component function. */
type ElementType = string | ((props: never) => unknown)

/** JSX Element type for Three.js renderer. */
interface JSXElement {
    type: ElementType
    props: Record<string, unknown>
    children?: JSXElement[]
}

/** JSX Node type. */
type JSXNode = JSXElement | JSXElement[] | string | number | boolean | null | undefined

// Type definitions for Three.js JSX elements
declare global {
    namespace JSX {
        interface IntrinsicElements {
            scene: {
                background?: string | number
                fog?: { color?: string | number; near?: number; far?: number }
                children?: JSXNode
            }
            camera: {
                position?: [number, number, number]
                rotation?: [number, number, number]
                fov?: number
                aspect?: number
                near?: number
                far?: number
                lookAt?: [number, number, number]
            }
            ambientLight: { color?: string | number; intensity?: number }
            directionalLight: {
                color?: string | number
                intensity?: number
                position?: [number, number, number]
                castShadow?: boolean
            }
            pointLight: {
                color?: string | number
                intensity?: number
                position?: [number, number, number]
                distance?: number
                decay?: number
            }
            mesh: {
                position?: [number, number, number]
                rotation?: [number, number, number]
                scale?: [number, number, number]
                castShadow?: boolean
                receiveShadow?: boolean
                visible?: boolean
                onUpdate?: (mesh: Three.Mesh, time: number, delta: number) => void
                children?: JSXNode
            }
            group: {
                position?: [number, number, number]
                rotation?: [number, number, number]
                scale?: [number, number, number]
                visible?: boolean
                children?: JSXNode
            }
            boxGeometry: { args?: [number?, number?, number?, number?, number?, number?] }
            sphereGeometry: { args?: [number?, number?, number?, number?, number?, number?, number?] }
            meshBasicMaterial: { color?: string | number }
            meshStandardMaterial: { color?: string | number; metalness?: number; roughness?: number }
        }
    }
}

/**
 * Three.js JSX Renderer.
 *
 * @global
 * @example
 * ```ts
 * const renderer = new ThreeJSXRenderer()
 * renderer.render({
 *   type: 'scene',
 *   props: { background: 0x111111 },
 *   children: [
 *     { type: 'mesh', props: { position: [0, 0, 0] }, children: [
 *       { type: 'boxGeometry', props: { args: [1, 1, 1] } },
 *       { type: 'meshStandardMaterial', props: { color: 0x00ff00 } }
 *     ]}
 *   ]
 * })
 * ```
 */
export class ThreeJSXRenderer {
    /** Three.js scene. */
    scene: Three.Scene
    /** Perspective camera. */
    camera: Three.PerspectiveCamera
    /** WebGL renderer. */
    renderer: Three.WebGLRenderer | null = null
    /** Clock for animations. */
    clock: Three.Clock

    private objects = new Map<string, Three.Object3D>()
    private updateCallbacks = new Map<string, (obj: unknown, time: number, delta: number) => void>()

    /**
     * @param container - Optional container element.
     */
    constructor(container?: HTMLElement) {
        this.scene = new Three.Scene()
        this.camera = new Three.PerspectiveCamera(75, 1, 0.1, 1000)
        this.clock = new Three.Clock()

        this.init(container)
    }

    private init(container?: HTMLElement): void {
        if (typeof window !== 'undefined') {
            this.renderer = new Three.WebGLRenderer({ antialias: true })
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.setClearColor(0x111111)

            if (container) {
                container.appendChild(this.renderer.domElement)
            }
        }

        this.camera.position.set(5, 5, 5)
        this.camera.lookAt(0, 0, 0)
    }

    /**
     * Render JSX elements to the Three.js scene.
     *
     * @param element - JSX element or array of elements.
     */
    render(element: JSXElement | JSXElement[]): void {
        this.clearScene()
        this.updateCallbacks.clear()

        if (Array.isArray(element)) {
            for (const el of element) {
                this.renderElement(el, this.scene)
            }
        } else {
            this.renderElement(element, this.scene)
        }

        if (this.renderer) {
            this.renderer.render(this.scene, this.camera)
        }
    }

    private clearScene(): void {
        const objectsToRemove: Three.Object3D[] = []
        this.scene.traverse((child) => {
            if (child !== this.scene) {
                objectsToRemove.push(child)
            }
        })

        for (const obj of objectsToRemove) {
            this.scene.remove(obj)

            if ('geometry' in obj && obj.geometry) {
                ;(obj.geometry as Three.BufferGeometry).dispose()
            }

            if ('material' in obj && obj.material) {
                const material = obj.material as Three.Material | Three.Material[]
                if (Array.isArray(material)) {
                    for (const mat of material) mat.dispose()
                } else {
                    material.dispose()
                }
            }
        }
    }

    private renderElement(element: JSXElement, parent: Three.Object3D): Three.Object3D | null {
        if (!element) return null

        const { type, props, children } = element
        const key = this.generateKey(type, props)

        switch (type) {
            case 'scene':
                return this.renderScene(props, children ?? [])
            case 'camera':
                return this.renderCamera(props)
            case 'ambientLight':
                return this.renderAmbientLight(props, parent, key)
            case 'directionalLight':
                return this.renderDirectionalLight(props, parent, key)
            case 'pointLight':
                return this.renderPointLight(props, parent, key)
            case 'mesh':
                return this.renderMesh(props, children ?? [], parent, key)
            case 'group':
                return this.renderGroup(props, children ?? [], parent, key)
            default:
                return null
        }
    }

    private generateKey(type: ElementType, props: Record<string, unknown>): string {
        const typeStr = typeof type === 'string' ? type : type.name
        return `${typeStr}_${JSON.stringify(props)}`
    }

    private renderScene(props: Record<string, unknown>, children: JSXElement[]): Three.Scene {
        if (props.background !== undefined) {
            this.scene.background = new Three.Color(props.background as number | string)
        }

        for (const child of children) {
            this.renderElement(child, this.scene)
        }

        return this.scene
    }

    private renderCamera(props: Record<string, unknown>): Three.PerspectiveCamera {
        if (props.fov !== undefined) this.camera.fov = props.fov as number
        if (props.aspect !== undefined) this.camera.aspect = props.aspect as number
        if (props.near !== undefined) this.camera.near = props.near as number
        if (props.far !== undefined) this.camera.far = props.far as number

        if (props.position) this.camera.position.set(...(props.position as [number, number, number]))
        if (props.rotation) this.camera.rotation.set(...(props.rotation as [number, number, number]))
        if (props.lookAt) this.camera.lookAt(...(props.lookAt as [number, number, number]))

        this.camera.updateProjectionMatrix()
        return this.camera
    }

    private renderAmbientLight(
        props: Record<string, unknown>,
        parent: Three.Object3D,
        key: string
    ): Three.AmbientLight {
        const { color = 0xffffff, intensity = 1 } = props
        const light = new Three.AmbientLight(color as number, intensity as number)
        parent.add(light)
        this.objects.set(key, light)
        return light
    }

    private renderDirectionalLight(
        props: Record<string, unknown>,
        parent: Three.Object3D,
        key: string
    ): Three.DirectionalLight {
        const { color = 0xffffff, intensity = 1, position = [0, 1, 0], castShadow = false } = props
        const light = new Three.DirectionalLight(color as number, intensity as number)
        light.position.set(...(position as [number, number, number]))
        light.castShadow = castShadow as boolean
        parent.add(light)
        this.objects.set(key, light)
        return light
    }

    private renderPointLight(props: Record<string, unknown>, parent: Three.Object3D, key: string): Three.PointLight {
        const { color = 0xffffff, intensity = 1, position = [0, 0, 0], distance = 0, decay = 2 } = props
        const light = new Three.PointLight(color as number, intensity as number, distance as number, decay as number)
        light.position.set(...(position as [number, number, number]))
        parent.add(light)
        this.objects.set(key, light)
        return light
    }

    private renderMesh(
        props: Record<string, unknown>,
        children: JSXElement[],
        parent: Three.Object3D,
        key: string
    ): Three.Mesh {
        const mesh = new Three.Mesh()

        if (props.position) mesh.position.set(...(props.position as [number, number, number]))
        if (props.rotation) mesh.rotation.set(...(props.rotation as [number, number, number]))
        if (props.scale) mesh.scale.set(...(props.scale as [number, number, number]))
        if (props.visible !== undefined) mesh.visible = props.visible as boolean
        if (props.castShadow !== undefined) mesh.castShadow = props.castShadow as boolean
        if (props.receiveShadow !== undefined) mesh.receiveShadow = props.receiveShadow as boolean

        for (const child of children) {
            const obj = this.createGeometryOrMaterial(child)
            if (obj) {
                if ('isBufferGeometry' in obj) {
                    mesh.geometry = obj as Three.BufferGeometry
                } else if ('isMaterial' in obj) {
                    mesh.material = obj as Three.Material
                }
            }
        }

        if (props.onUpdate) {
            this.updateCallbacks.set(key, props.onUpdate as (obj: unknown, time: number, delta: number) => void)
        }

        parent.add(mesh)
        this.objects.set(key, mesh)
        return mesh
    }

    private renderGroup(
        props: Record<string, unknown>,
        children: JSXElement[],
        parent: Three.Object3D,
        key: string
    ): Three.Group {
        const group = new Three.Group()

        if (props.position) group.position.set(...(props.position as [number, number, number]))
        if (props.rotation) group.rotation.set(...(props.rotation as [number, number, number]))
        if (props.scale) group.scale.set(...(props.scale as [number, number, number]))
        if (props.visible !== undefined) group.visible = props.visible as boolean

        for (const child of children) {
            this.renderElement(child, group)
        }

        parent.add(group)
        this.objects.set(key, group)
        return group
    }

    private createGeometryOrMaterial(element: JSXElement): Three.BufferGeometry | Three.Material | null {
        const { type, props } = element
        const args = props.args as number[] | undefined

        switch (type) {
            case 'boxGeometry':
                return new Three.BoxGeometry(...((args || [1, 1, 1]) as [number, number, number]))
            case 'sphereGeometry':
                return new Three.SphereGeometry(...((args || [1, 8, 6]) as [number, number, number]))
            case 'meshBasicMaterial':
                return new Three.MeshBasicMaterial({ color: props.color as number | string })
            case 'meshStandardMaterial':
                return new Three.MeshStandardMaterial({
                    color: props.color as number | string,
                    metalness: (props.metalness as number) ?? 0,
                    roughness: (props.roughness as number) ?? 1,
                })
            default:
                return null
        }
    }

    /**
     * Dispose of all resources.
     */
    dispose(): void {
        this.clearScene()
        this.renderer?.dispose()
    }
}
