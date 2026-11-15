/**
 * Arbor Visual Tests — Non-interactive Capture
 *
 * Runs all scenarios with auto-advance for tmux capture-pane.
 *
 * Usage (tmux):
 *   tmux new-session -d -s arbor-capture -x 100 -y 40 "npx tsx arbor/visual-tests/capture.ts"
 *   sleep 15 && tmux capture-pane -p -t arbor-capture
 */
import ArborTree from '../src/ArborTree'
import ArborNode from '../src/ArborNode'
import { invoke } from '../src/invoke'
import { clear, createStepContext } from './kit'

const ctx = createStepContext()

// Override pause for auto-advance
const STEP = 1000 // ms
const SCENE = 2000
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const pause = async (): Promise<'next'> => {
    await delay(STEP)
    return 'next'
}
const scenePause = async () => {
    await delay(SCENE)
}

// ── Arbor renderer ───────────────────────────────────────────────────────

function renderTree(tree: ArborTree): string {
    interface R {
        id: number
        label: string
        children: R[]
        disposed: boolean
    }

    function build(node: ArborTree | ArborNode): R {
        const label = 'isArborTree' in node && node.isArborTree ? `Tree #${node.id}` : `Node #${node.id}`
        const host = node.host?.constructor?.name
        const ctxKeys = node._contexts ? Object.keys(node._contexts) : []
        const mp = 'isArborNode' in node && (node as ArborNode).__parents?.length > 1

        let full = label
        if (host) full += ` [${host}]`
        if (ctxKeys.length) full += ` ctx:${ctxKeys.join(',')}`
        if (mp) full += ` (${(node as ArborNode).__parents.length}p)`

        return { id: node.id, label: full, children: node._children.map(build), disposed: node.disposed }
    }

    function render(r: R, indent = '', last = true): string[] {
        const prefix = indent + (last ? '└── ' : '├── ')
        const ci = indent + (last ? '    ' : '│   ')
        const mark = r.disposed ? ' 💀' : ' 🟢'
        const lines = [`${prefix}${r.label}${mark}`]
        r.children.forEach((c, i) => {
            lines.push(...render(c, ci, i === r.children.length - 1))
        })
        return lines
    }

    return render(build(tree), '', true).join('\n')
}

function show(title: string, tree: ArborTree, extra = ''): void {
    ctx.show(title, renderTree(tree), extra)
}

// ── Run all ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    clear()
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                🌳 ARBOR — Visual Tests (capture)                   ║
╚══════════════════════════════════════════════════════════════════════╝
`)
    await scenePause()

    // Scene 1: Tree growth
    {
        const t = new ArborTree()
        show('Scene 1: Empty tree', t)
        await pause()
        new ArborNode(t)
        t.commit()
        show('+ Node #2', t)
        await pause()
        new ArborNode(t)
        t.commit()
        show('+ Node #3', t)
        await pause()
        const n4 = new ArborNode(t)
        t.commit()
        show('+ Node #4', t)
        await pause()
        new ArborNode(n4)
        t.commit()
        show('+ Grandchild', t)
        await pause()
        await t.dispose()
        show('tree.dispose()', t)
        await scenePause()
    }

    // Scene 2: Cascade
    {
        const t = new ArborTree()
        const a = new ArborNode(t)
        const b = new ArborNode(a)
        new ArborNode(b)
        t.commit()
        show('Scene 2: 3-level', t)
        await pause()
        await b.dispose()
        show('Mid disposed', t)
        await pause()
        await t.dispose()
        show('Tree disposed', t)
        await scenePause()
    }

    // Scene 3: Multi-parent
    {
        const t = new ArborTree()
        const p1 = new ArborNode(t)
        const p2 = new ArborNode(t)
        const s = new ArborNode(p1)
        s.addParent(p2)
        t.commit()
        show('Scene 3: 2 parents, 1 child', t)
        await pause()
        await p1.dispose()
        show('p1 gone → child alive', t)
        await pause()
        await p2.dispose()
        show('p2 gone → child dead', t)
        await scenePause()
    }

    // Scene 4: Context
    {
        class AppConfig {
            static context = true as const
            constructor(public theme: string) {}
        }
        class UserSession {
            static context = true as const
            constructor(public token: string) {}
        }
        const t = new ArborTree()
        new ArborNode(t)
        new ArborNode(t)
        t.commit()
        show('Scene 4: No context', t)
        await pause()
        t.addContext(new AppConfig('dark'))
        t.commit()
        show('+ AppConfig', t)
        await pause()
        t.addContext(new UserSession('tok'))
        t.commit()
        show('+ UserSession', t)
        await scenePause()
    }

    // Scene 5: Invoke
    {
        class S {
            node!: ArborNode
            c = 0
            @invoke('update') u(_: number): void {
                this.c++
            }
            @invoke('render') r(): void {}
        }
        const t = new ArborTree()
        const s = new S()
        s.node = new ArborNode(t, s)
        t.commit()
        show('Scene 5: @invoke', t, `  count: ${s.c}`)
        await pause()
        t.__invokeHooksDispatch('update', 0.016)
        show('Tick 1', t, `  count: ${s.c}`)
        await pause()
        t.__invokeHooksDispatch('update', 0.032)
        show('Tick 2', t, `  count: ${s.c}`)
        await pause()
        t.__invokeHooksDispatch('update', 0.016)
        show('Tick 3', t, `  count: ${s.c}`)
        await pause()
        await s.node.dispose()
        show('Disposed → cleanup', t, `  count: ${s.c}`)
        await scenePause()
    }

    // Scene 6: Full lifecycle
    {
        const t = new ArborTree()
        const root = new ArborNode(t)
        const b1 = new ArborNode(root)
        new ArborNode(root)
        const b3 = new ArborNode(b1)
        new ArborNode(b3)
        t.commit()
        show('Scene 6: Full tree', t)
        await pause()
        await b3.dispose()
        show('Prune b3', t)
        await pause()
        new ArborNode(root)
        t.commit()
        show('Add branch', t)
        await pause()
        await t.dispose()
        show('Destroy', t)
        await scenePause()
    }

    clear()
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    ✅ All 6 scenes complete                          ║
╚══════════════════════════════════════════════════════════════════════╝
`)
}

main().catch(console.error)
