import { createSignal, flush, For, Show } from 'solid-js'
import { describe, expect, it } from 'vitest'
import type { JSX } from './jsx-runtime'
import { defineElement, JSXElementNode, type JSXNode, JSXTextNode } from './nodes'
import { render } from './renderer'

function mount(view: () => JSX.Element): { root: JSXElementNode; dispose: () => void } {
    const root = new JSXElementNode('root')
    const dispose = render(view, root)
    flush()
    return { root, dispose }
}

function element(node: JSXNode | undefined): JSXElementNode {
    if (!(node instanceof JSXElementNode)) throw new Error('expected JSXElementNode')
    return node
}

function elements(node: JSXElementNode): JSXElementNode[] {
    return node.children.filter((child): child is JSXElementNode => child instanceof JSXElementNode)
}

function text(node: JSXElementNode): string {
    return node.children
        .filter((child): child is JSXTextNode => child instanceof JSXTextNode)
        .map((child) => child.value)
        .join('')
}

describe('universal renderer', () => {
    it('mounts intrinsic elements with static props', () => {
        const { root } = mount(() => <box x={1} label="crate" />)

        const box = element(root.children[0])
        expect(box.tag).toBe('box')
        expect(box.props).toEqual({ x: 1, label: 'crate' })
    })

    it('updates a reactive prop after flush', () => {
        const [x, setX] = createSignal(1)
        const { root } = mount(() => <box x={x()} />)
        const box = element(root.children[0])

        setX(5)
        expect(box.props.x).toBe(1)
        flush()

        expect(box.props.x).toBe(5)
    })

    it('updates reactive text', () => {
        const [count, setCount] = createSignal(0)
        const { root } = mount(() => <caption>{count()}</caption>)
        const caption = element(root.children[0])

        setCount(3)
        flush()

        expect(text(caption)).toBe('3')
    })

    it('adds and removes nodes with Show', () => {
        const [visible, setVisible] = createSignal(false)
        const { root } = mount(() => (
            <box>
                <Show when={visible()}>
                    <text value="shown" />
                </Show>
            </box>
        ))
        const box = element(root.children[0])
        expect(elements(box)).toEqual([])

        setVisible(true)
        flush()
        expect(elements(box).map((node) => node.props.value)).toEqual(['shown'])

        setVisible(false)
        flush()
        expect(elements(box)).toEqual([])
    })

    it('keeps list order with For', () => {
        const [items, setItems] = createSignal(['a', 'b', 'c'])
        const { root } = mount(() => (
            <list>
                <For each={items()}>{(item) => <item name={item} />}</For>
            </list>
        ))
        const list = element(root.children[0])
        const names = (): unknown[] => elements(list).map((node) => node.props.name)
        expect(names()).toEqual(['a', 'b', 'c'])

        const [first] = elements(list)
        setItems(['c', 'a'])
        flush()

        expect(names()).toEqual(['c', 'a'])
        expect(elements(list)[1]).toBe(first)
    })

    it('passes reactive props into components', () => {
        function Badge(props: { title: string }): JSX.Element {
            return <badge title={props.title} />
        }

        const [title, setTitle] = createSignal('one')
        const { root } = mount(() => <Badge title={title()} />)
        const badge = element(root.children[0])

        setTitle('two')
        flush()

        expect(badge.props.title).toBe('two')
    })

    it('clears the root on dispose', () => {
        const { root, dispose } = mount(() => (
            <box>
                <item />
            </box>
        ))

        dispose()

        expect(root.children).toEqual([])
    })
})

describe('defineElement', () => {
    class Sprite implements JSXNode {
        readonly calls: string[] = []
        readonly children: JSXNode[] = []

        setJSXProperty(name: string, value: unknown): void {
            this.calls.push(`${name}=${String(value)}`)
        }

        insertJSXChild(child: JSXNode): void {
            this.children.push(child)
        }

        removeJSXChild(child: JSXNode): void {
            this.children.splice(this.children.indexOf(child), 1)
        }

        getJSXChildren(): readonly JSXNode[] {
            return this.children
        }
    }

    defineElement('test-sprite', () => new Sprite())

    it('creates engine nodes for a registered tag', () => {
        const [color, setColor] = createSignal('red')
        const { root } = mount(() => (
            <test-sprite color={color()}>
                <item />
            </test-sprite>
        ))
        const sprite = root.children[0]
        if (!(sprite instanceof Sprite)) throw new Error('expected Sprite')

        setColor('blue')
        flush()

        expect(sprite.calls).toEqual(['color=red', 'color=blue'])
        expect(element(sprite.children[0]).tag).toBe('item')
    })

    it('disposes engine nodes when their owner is disposed', () => {
        const disposed: string[] = []

        class Resource extends JSXElementNode {
            disposeJSX(): void {
                disposed.push(String(this.props.name))
            }
        }

        defineElement('test-resource', (tag) => new Resource(tag))

        const [visible, setVisible] = createSignal(true)
        const { dispose } = mount(() => (
            <box>
                <test-resource name="always" />
                <Show when={visible()}>
                    <test-resource name="branch" />
                </Show>
            </box>
        ))

        setVisible(false)
        flush()
        expect(disposed).toEqual(['branch'])

        dispose()
        expect(disposed).toEqual(['branch', 'always'])
    })

    it('rejects a duplicate tag', () => {
        expect(() => defineElement('test-sprite', () => new Sprite())).toThrow(/"test-sprite" is already defined/)
    })
})
