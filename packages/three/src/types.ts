import type { JSX } from '@sky-modules/jsx'
import type { Color, ColorRepresentation, Euler, Object3D, Vector2, Vector3 } from 'three'
import type { GEOMETRY_ELEMENTS, MATERIAL_ELEMENTS, OBJECT_ELEMENTS } from './elements'
import type { EulerLike, ThreeNode, ThreeObject, Vector2Like, Vector3Like } from './ThreeNode'

export type Vector3Input = readonly [x: number, y: number, z: number] | Vector3Like
export type EulerInput = readonly [x: number, y: number, z: number] | EulerLike

/** JSX value accepted for an instance field. */
type FieldInput<V> = V extends Color
    ? ColorRepresentation
    : V extends Vector3
      ? Vector3Input
      : V extends Vector2
        ? readonly [x: number, y: number] | Vector2Like
        : V extends Euler
          ? EulerInput
          : V

type FunctionKeys<T> = { [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never }[keyof T]

/** Instance fields as optional JSX props (methods excluded). */
type FieldProps<T> = { [K in Exclude<keyof T, FunctionKeys<T>>]?: FieldInput<T[K]> }

type Constructor = abstract new (...args: never[]) => unknown

// Type aliases (not interfaces) keep the implicit index signature required by JSX.IntrinsicElements
type BaseProps<C extends Constructor> = {
    ref?: (node: ThreeNode<Extract<InstanceType<C>, ThreeObject>>) => void
    children?: JSX.Element
    args?: ConstructorParameters<C>
}

type Object3DProps = {
    position?: Vector3Input
    rotation?: EulerInput
    scale?: Vector3Input | number
    lookAt?: Vector3Input
}

type ElementProps<C extends Constructor> = BaseProps<C> &
    (InstanceType<C> extends Object3D
        ? Object3DProps & Omit<FieldProps<InstanceType<C>>, keyof Object3DProps | 'children' | 'parent'>
        : FieldProps<InstanceType<C>>)

type ElementsOf<M extends Record<string, Constructor>> = { [K in keyof M]: ElementProps<M[K]> }

/** Intrinsic JSX elements provided by `@sky-modules/three`. */
export type ThreeIntrinsicElements = ElementsOf<typeof OBJECT_ELEMENTS> &
    ElementsOf<typeof GEOMETRY_ELEMENTS> &
    ElementsOf<typeof MATERIAL_ELEMENTS>
