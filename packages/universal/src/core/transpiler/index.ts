/**
 * Fusion Components — Sky Universal Transpiler
 *
 * Custom cross-framework component transpiler.
 * Transpiles .x.tsx / .lite.tsx components to React, Vue, Solid, Svelte, Qwik, Angular, Lit.
 *
 * @module
 */

export { transpile, parseSource } from './parser'
export type { Framework, TranspileResult, ParseResult, Generator } from './types'
export { ReactGenerator } from './react'
export { SolidGenerator } from './solid'
export { VueGenerator } from './vue'
export { SvelteGenerator } from './svelte'
export { QwikGenerator } from './qwik'
export { AngularGenerator } from './angular'
export { LitGenerator } from './lit'
