import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'
import { LOCALES, ROOT_DIR, listDocPackages, type Locale } from '../../scripts/docs-packages'

const PROJECT_TITLE = 'Sky Modules'

const LABELS: Record<Locale, { label: string; description: string; packages: string; guide: string }> = {
    en: {
        label: 'English',
        description: 'Sky Modules monorepo documentation',
        packages: 'Packages',
        guide: 'Guide',
    },
    ru: {
        label: 'Русский',
        description: 'Документация монорепозитория Sky Modules',
        packages: 'Пакеты',
        guide: 'Руководство',
    },
}

interface RootManifest {
    repository: { url: string }
}

const REPOSITORY_URL = (JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8')) as RootManifest).repository.url

/** On GitHub Actions the site lives under `/<repository>/`, locally under `/`. */
function resolveBase(): string {
    const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
    return repository ? `/${repository}/` : '/'
}

function packagesSidebar(locale: Locale): DefaultTheme.SidebarItem[] {
    return listDocPackages(locale).map(({ name, pages }) => ({
        text: name,
        collapsed: true,
        items: pages.map(({ slug, title }) => ({
            text: slug === 'index' ? name : title,
            link: `/${locale}/packages/${name}/${slug === 'index' ? '' : slug}`,
        })),
    }))
}

function localeConfig(locale: Locale): DefaultTheme.Config {
    return {
        nav: [{ text: LABELS[locale].packages, link: `/${locale}/packages/` }],
        sidebar: { [`/${locale}/packages/`]: packagesSidebar(locale) },
    }
}

export default defineConfig({
    title: PROJECT_TITLE,
    base: resolveBase(),
    cleanUrls: true,
    srcExclude: ['**/README.md'],
    // Relative links that leave the docs tree point at repository directories, not at site pages.
    ignoreDeadLinks: [/^\.\.?\//],
    locales: Object.fromEntries(
        LOCALES.map((locale) => [
            locale,
            {
                label: LABELS[locale].label,
                lang: locale,
                link: `/${locale}/`,
                description: LABELS[locale].description,
                themeConfig: localeConfig(locale),
            },
        ])
    ),
    themeConfig: {
        search: { provider: 'local' },
        socialLinks: [{ icon: 'github', link: REPOSITORY_URL }],
        editLink: { pattern: `${REPOSITORY_URL}/edit/main/docs/:path` },
    },
})
