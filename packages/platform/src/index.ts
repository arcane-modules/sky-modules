export { runsOnSide, runsOnServerSide, runsOnClientSide } from './runsOnSide'

export {
    platform,
    isCirrus,
    isNode,
    isBrowser,
    isWebWorker,
    isDeno,
    isBun,
    isElectron,
    isTauri,
    isCapacitor,
} from './platformDetect'
export type { Platform } from './platformDetect'

export { arch, isX64, isArm64 } from './arch'
export type { Arch } from './arch'

export { os, isMac, isWindows, isLinux, isAndroid, isIOS } from './os'
export type { OS } from './os'

export { appPlatformTarget } from './appPlatformTarget'
export type { AppPlatformTarget } from './appPlatformTarget'
