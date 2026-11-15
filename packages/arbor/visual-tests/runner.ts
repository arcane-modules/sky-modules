/**
 * Arbor Visual Tests
 *
 * Interactive scenario runner using visual-test-kit.
 *
 * Usage: npx tsx arbor/visual-tests/runner.ts
 */
import ArborTree from '../src/ArborTree'
import ArborNode from '../src/ArborNode'
import { invoke } from '../src/invoke'
import { runner, defineScenario } from './kit'

// ── Arbor-specific tree renderer ─────────────────────────────────────────

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

// ── Scenarios ────────────────────────────────────────────────────────────

const scenarios = [
    defineScenario('Tree growth', async ({ show, pause }) => {
        const tree = new ArborTree()
        show('Empty tree', renderTree(tree))
        if ((await pause()) === 'quit') return

        new ArborNode(tree)
        tree.commit()
        show('+ Node #2', renderTree(tree))
        if ((await pause()) === 'quit') return

        new ArborNode(tree)
        tree.commit()
        show('+ Node #3', renderTree(tree))
        if ((await pause()) === 'quit') return

        const n4 = new ArborNode(tree)
        tree.commit()
        show('+ Node #4', renderTree(tree))
        if ((await pause()) === 'quit') return

        new ArborNode(n4)
        tree.commit()
        show('+ Grandchild under #4', renderTree(tree))
        if ((await pause()) === 'quit') return

        await tree.dispose()
        show('tree.dispose()', renderTree(tree))
        await pause()
    }),

    defineScenario('Cascade dispose', async ({ show, pause }) => {
        const tree = new ArborTree()
        const a = new ArborNode(tree)
        const b = new ArborNode(a)
        new ArborNode(b)
        tree.commit()

        show('3-level hierarchy', renderTree(tree))
        if ((await pause()) === 'quit') return

        await b.dispose()
        show('Mid-level disposed → children gone', renderTree(tree))
        if ((await pause()) === 'quit') return

        await tree.dispose()
        show('Tree disposed', renderTree(tree))
        await pause()
    }),

    defineScenario('Multi-parent', async ({ show, pause }) => {
        const tree = new ArborTree()
        const p1 = new ArborNode(tree)
        const p2 = new ArborNode(tree)
        const shared = new ArborNode(p1)
        shared.addParent(p2)
        tree.commit()

        show('2 parents, 1 shared child', renderTree(tree), '  Node appears under BOTH parents')
        if ((await pause()) === 'quit') return

        await p1.dispose()
        show('p1 disposed → child STILL ALIVE', renderTree(tree))
        if ((await pause()) === 'quit') return

        await p2.dispose()
        show('p2 disposed → child gone', renderTree(tree))
        await pause()
    }),

    defineScenario('Context flow', async ({ show, pause }) => {
        class AppConfig {
            static context = true as const
            constructor(public theme: string) {}
        }
        class UserSession {
            static context = true as const
            constructor(public token: string) {}
        }

        const tree = new ArborTree()
        new ArborNode(tree)
        new ArborNode(tree)
        tree.commit()

        show('No context', renderTree(tree))
        if ((await pause()) === 'quit') return

        tree.addContext(new AppConfig('dark'))
        tree.commit()
        show('+ AppConfig("dark") → flows down', renderTree(tree))
        if ((await pause()) === 'quit') return

        tree.addContext(new UserSession('tok_abc'))
        tree.commit()
        show('+ UserSession → all children have both', renderTree(tree))
        await pause()
    }),

    defineScenario('@invoke hooks', async ({ show, pause }) => {
        class PlayerSystem {
            node!: ArborNode
            updateCount = 0
            @invoke('update') onUpdate(_: number): void {
                this.updateCount++
            }
            @invoke('render') onRender(): void {}
        }

        const tree = new ArborTree()
        const sys = new PlayerSystem()
        sys.node = new ArborNode(tree, sys)
        tree.commit()

        show('@invoke hooks', renderTree(tree), `  updateCount: ${sys.updateCount}\n  Hooks: update, render`)
        if ((await pause()) === 'quit') return

        tree.__invokeHooksDispatch('update', 0.016)
        show('Tick 1', renderTree(tree), `  updateCount: ${sys.updateCount}`)
        if ((await pause()) === 'quit') return

        tree.__invokeHooksDispatch('update', 0.032)
        show('Tick 2', renderTree(tree), `  updateCount: ${sys.updateCount}`)
        if ((await pause()) === 'quit') return

        tree.__invokeHooksDispatch('update', 0.016)
        show('Tick 3', renderTree(tree), `  updateCount: ${sys.updateCount}`)
        if ((await pause()) === 'quit') return

        await sys.node.dispose()
        show(
            'Node disposed → hooks auto-cleanup',
            renderTree(tree),
            `  updateCount: ${sys.updateCount}\n  💀 Hook unsubscribed`
        )
        await pause()
    }),

    defineScenario('Full lifecycle', async ({ show, pause }) => {
        const tree = new ArborTree()
        const root = new ArborNode(tree)
        const b1 = new ArborNode(root)
        new ArborNode(root)
        const b3 = new ArborNode(b1)
        new ArborNode(b3)
        tree.commit()

        show('🌱 Full tree grown', renderTree(tree))
        if ((await pause()) === 'quit') return

        await b3.dispose()
        show('✂️ b3 pruned → child gone', renderTree(tree))
        if ((await pause()) === 'quit') return

        new ArborNode(root)
        tree.commit()
        show('🌿 New branch added', renderTree(tree))
        if ((await pause()) === 'quit') return

        await tree.dispose()
        show('💀 Complete cleanup', renderTree(tree))
        await pause()
    }),
]

runner(scenarios, '🌳 Arbor — Visual Tests')
