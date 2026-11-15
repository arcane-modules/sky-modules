import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import { LOCALES, listDocPackages, packageDocsDir, syncedDocsDir } from './docs-packages'

/** Copies package markdown docs into the VitePress source tree. */
for (const locale of LOCALES) {
    for (const { name } of listDocPackages(locale)) {
        const source = packageDocsDir(name, locale)
        const target = syncedDocsDir(name, locale)

        if (existsSync(target)) rmSync(target, { recursive: true })
        mkdirSync(dirname(target), { recursive: true })
        cpSync(source, target, { recursive: true })
        console.log(`docs: ${locale}/${name}`)
    }
}
