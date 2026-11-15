/** Subset of globals that environment detection reads. Every field may be missing at runtime. */
interface RuntimeGlobals {
    __CIRRUS__?: unknown
    process?: {
        versions?: { electron?: string; node?: string }
        platform?: string
        arch?: string
    }
    window?: {
        __TAURI__?: unknown
        Capacitor?: { isNative?: unknown; getPlatform?: () => string }
    }
    navigator?: { userAgent?: string; platform?: string; product?: string }
    self?: unknown
}

export const runtimeGlobals = globalThis as unknown as RuntimeGlobals
