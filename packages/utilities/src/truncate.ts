/**
 * @global
 * Truncate options.
 */
export interface TruncateOptions {
    /** Suffix to add when truncated (default: '...') */
    suffix?: string
    /** Truncate at word boundary (default: true) */
    wordBoundary?: boolean
}

/**
 * @global
 * Truncate text to specified length with suffix.
 *
 * @param text - Input text
 * @param length - Maximum length
 * @param options - Truncate options
 * @returns Truncated text with suffix
 * @example
 * ```typescript
 * truncate('Hello World', 8)         // 'Hello...'
 * truncate('Hello World', 20)        // 'Hello World'
 * ```
 */
export function truncate(text: string, length: number, options: TruncateOptions = {}): string {
    const { suffix = '...', wordBoundary = true } = options

    if (text.length <= length) {
        return text
    }

    const maxContent = length - suffix.length

    if (maxContent <= 0) {
        return suffix.slice(0, length)
    }

    let result = text.slice(0, maxContent)

    if (wordBoundary) {
        const lastSpace = result.lastIndexOf(' ')

        if (lastSpace > maxContent / 3) {
            result = result.slice(0, lastSpace)
        }
    }

    return result.trimEnd() + suffix
}
