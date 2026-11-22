import { defineElement } from '@sky-modules/jsx'
import {
    AmbientLight,
    BoxGeometry,
    BufferGeometry,
    CapsuleGeometry,
    CircleGeometry,
    ConeGeometry,
    CylinderGeometry,
    DirectionalLight,
    DodecahedronGeometry,
    EdgesGeometry,
    Group,
    HemisphereLight,
    IcosahedronGeometry,
    Line,
    LineBasicMaterial,
    LineLoop,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    PlaneGeometry,
    PointLight,
    Points,
    PointsMaterial,
    RingGeometry,
    ShaderMaterial,
    ShapeGeometry,
    SphereGeometry,
    SpotLight,
    TorusGeometry,
} from 'three'
import { type ThreeObject, ThreeNode } from './ThreeNode'

/** Object classes available as JSX tags. */
export const OBJECT_ELEMENTS = {
    group: Group,
    mesh: Mesh,
    line: Line,
    lineLoop: LineLoop,
    lineSegments: LineSegments,
    points: Points,
    ambientLight: AmbientLight,
    directionalLight: DirectionalLight,
    pointLight: PointLight,
    spotLight: SpotLight,
    hemisphereLight: HemisphereLight,
} as const

/** Geometry classes available as JSX tags; `args` are constructor arguments. */
export const GEOMETRY_ELEMENTS = {
    bufferGeometry: BufferGeometry,
    boxGeometry: BoxGeometry,
    sphereGeometry: SphereGeometry,
    cylinderGeometry: CylinderGeometry,
    coneGeometry: ConeGeometry,
    capsuleGeometry: CapsuleGeometry,
    torusGeometry: TorusGeometry,
    ringGeometry: RingGeometry,
    planeGeometry: PlaneGeometry,
    circleGeometry: CircleGeometry,
    icosahedronGeometry: IcosahedronGeometry,
    dodecahedronGeometry: DodecahedronGeometry,
    edgesGeometry: EdgesGeometry,
    shapeGeometry: ShapeGeometry,
} as const

/** Material classes available as JSX tags. */
export const MATERIAL_ELEMENTS = {
    meshBasicMaterial: MeshBasicMaterial,
    meshStandardMaterial: MeshStandardMaterial,
    meshPhysicalMaterial: MeshPhysicalMaterial,
    lineBasicMaterial: LineBasicMaterial,
    pointsMaterial: PointsMaterial,
    shaderMaterial: ShaderMaterial,
} as const

export const THREE_ELEMENTS = { ...OBJECT_ELEMENTS, ...GEOMETRY_ELEMENTS, ...MATERIAL_ELEMENTS } as const

export type ThreeTag = keyof typeof THREE_ELEMENTS

type ThreeConstructor = new (...args: never[]) => ThreeObject

for (const [tag, Constructor] of Object.entries(THREE_ELEMENTS) as [ThreeTag, ThreeConstructor][]) {
    defineElement(tag, () => new ThreeNode(tag, (args) => new Constructor(...(args as never[]))))
}
