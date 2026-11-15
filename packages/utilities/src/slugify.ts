/**
 * @global
 * Transliteration map for Cyrillic characters.
 */
const CYRILLIC_MAP: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
}

/**
 * @global
 * Slugify options.
 */
export interface SlugifyOptions {
    /** Separator between words (default: '-') */
    separator?: string
    /** Convert to lowercase (default: true) */
    lowercase?: boolean
    /** Maximum length of the slug (default: unlimited) */
    maxLength?: number
}

/**
 * @global
 * Convert text to URL-safe slug.
 *
 * Handles Cyrillic transliteration, unicode normalization, special chars removal.
 *
 * @param text - Input text
 * @param options - Slugify options
 * @returns URL-safe slug string
 * @example
 * ```typescript
 * slugify('Hello World!')        // 'hello-world'
 * slugify('Привет Мир!')         // 'privet-mir'
 * ```
 */
export function slugify(text: string, options: SlugifyOptions = {}): string {
    const { separator = '-', lowercase = true, maxLength } = options

    let result = text

    // Transliterate Cyrillic
    result = result
        .split('')
        .map((char) => {
            const lower = char.toLowerCase()

            if (lower in CYRILLIC_MAP) {
                const mapped = CYRILLIC_MAP[lower]
                return mapped ? (char === lower ? mapped : mapped.toUpperCase()) : char
            }

            return char
        })
        .join('')

    // Normalize unicode
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Escape separator for regex
    const escapedSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Replace non-alphanumeric with separator
    result = result.replace(/[^a-zA-Z0-9]+/g, separator)

    // Remove leading/trailing separators
    result = result.replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g'), '')

    // Collapse multiple separators
    result = result.replace(new RegExp(`${escapedSep}+`, 'g'), separator)

    // Apply lowercase
    if (lowercase) {
        result = result.toLowerCase()
    }

    // Apply max length (cut at word boundary)
    if (maxLength && result.length > maxLength) {
        result = result.slice(0, maxLength)
        const lastSep = result.lastIndexOf(separator)

        if (lastSep > maxLength / 2) {
            result = result.slice(0, lastSep)
        }
    }

    return result
}
