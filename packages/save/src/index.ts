/**
 * @sky-modules/save — Persistence (save/load) for reactive objects.
 *
 * Provides serialization/deserialization with class metadata preservation.
 * Unlike share(), save() serializes ALL fields including @secret ones.
 */

export { save } from './save'
export type { SaveOptions } from './save'

export { load } from './load'
export type { LoadOptions } from './load'

export { serializeWithMetadata } from './serialize'
export { deserializeWithMetadata } from './deserialize'
export type { SerializedData, SerializedSpecialType } from './serialize'
