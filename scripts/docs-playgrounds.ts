import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { PACKAGES_DIR, PLAYGROUND_OUTPUT_DIR, ROOT_DIR, listPlaygroundPackages } from './docs-packages'

/** Builds every package playground as a static site for embedding into the docs. */
for (const name of listPlaygroundPackages()) {
    const result = spawnSync(
        'pnpm',
        [
            'exec',
            'vite',
            'build',
            '--config',
            join(PACKAGES_DIR, name, 'playground', 'vite.config.ts'),
            '--base',
            './',
            '--outDir',
            join(PLAYGROUND_OUTPUT_DIR, name),
            '--emptyOutDir',
        ],
        { cwd: ROOT_DIR, stdio: 'inherit' }
    )

    if (result.status !== 0) {
        throw new Error(`Playground build failed: ${name}`)
    }
}
