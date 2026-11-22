import { createPlaygroundConfig } from '../../../vite.playground'
import { solidUniversal } from '../../jsx/src/vite'

export default createPlaygroundConfig(import.meta.dirname, { plugins: [solidUniversal()] })
