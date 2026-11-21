/**
 * Type-only stub at the three.js path so that copied math typings resolve unchanged.
 * Structural subset of the three.js type: only members read by the copied math code.
 */

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array

export interface BufferAttribute {
    readonly count: number
    getX(index: number): number
    getY(index: number): number
    getZ(index: number): number
    getW(index: number): number
}
