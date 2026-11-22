import { createPlaygroundConfig } from '../../../vite.playground'
import { solidUniversal } from '../src/vite'

export default createPlaygroundConfig(import.meta.dirname, { plugins: [solidUniversal()] })
