import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const LOCALES = ['en', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

export const ROOT_DIR = resolve(import.meta.dirname, '..')
export const PACKAGES_DIR = join(ROOT_DIR, 'packages')
export const DOCS_DIR = join(ROOT_DIR, 'docs')
export const PLAYGROUND_OUTPUT_DIR = join(DOCS_DIR, 'public', 'playground')

export interface DocPage {
    /** File name without extension, `index` for the package landing page. */
    slug: string
    title: string
}

export interface DocPackage {
    name: string
    pages: DocPage[]
}

/** Source directory with markdown files of a package for the given locale. */
export function packageDocsDir(packageName: string, locale: Locale): string {
    return join(PACKAGES_DIR, packageName, 'docs', locale)
}

/** Target directory inside the VitePress source tree. */
export function syncedDocsDir(packageName: string, locale: Locale): string {
    return join(DOCS_DIR, locale, 'packages', packageName)
}

/** Names of packages that have a playground. */
export function listPlaygroundPackages(): string[] {
    return readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => existsSync(join(PACKAGES_DIR, name, 'playground', 'vite.config.ts')))
        .sort()
}

function readTitle(filePath: string, fallback: string): string {
    const heading = readFileSync(filePath, 'utf8').match(/^#\s+(.+)$/m)
    return heading?.[1]?.trim() ?? fallback
}

/** Packages that provide markdown docs for the given locale. */
export function listDocPackages(locale: Locale): DocPackage[] {
    return readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => existsSync(join(packageDocsDir(name, locale), 'index.md')))
        .sort()
        .map((name) => {
            const dir = packageDocsDir(name, locale)
            const slugs = readdirSync(dir)
                .filter((file) => file.endsWith('.md'))
                .map((file) => file.slice(0, -'.md'.length))
                .sort((a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b)))

            return {
                name,
                pages: slugs.map((slug) => ({ slug, title: readTitle(join(dir, `${slug}.md`), slug) })),
            }
        })
}
