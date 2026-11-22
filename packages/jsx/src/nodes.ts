/**
 * Node contract driven by the universal renderer.
 * Implement it to plug an engine object (mesh, sprite, widget) into JSX.
 * The renderer tracks parents itself; a node only keeps its ordered children.
 */
export interface JSXNode {
    setJSXProperty(name: string, value: unknown, prev: unknown): void
    /** Inserts `child` before `anchor`, or appends when `anchor` is undefined. */
    insertJSXChild(child: JSXNode, anchor: JSXNode | undefined): void
    removeJSXChild(child: JSXNode): void
    getJSXChildren(): readonly JSXNode[]
    /**
     * Releases engine resources (GPU buffers, listeners).
     * Called once when the Solid owner that created the node is disposed: a `<Show>` branch,
     * a `<For>` item or the whole `render` tree. Moving a node between parents does not call it.
     */
    disposeJSX?(): void
}

/** Factory that creates the engine node for an intrinsic tag. */
export type JSXElementFactory = (tag: string) => JSXNode

const NO_CHILDREN: readonly JSXNode[] = Object.freeze([])

/** Default node for intrinsic tags without a registered factory. */
export class JSXElementNode implements JSXNode {
    readonly props: Record<string, unknown> = {}
    readonly children: JSXNode[] = []

    constructor(readonly tag: string) {}

    setJSXProperty(name: string, value: unknown): void {
        this.props[name] = value
    }

    insertJSXChild(child: JSXNode, anchor: JSXNode | undefined): void {
        const index = anchor === undefined ? -1 : this.children.indexOf(anchor)
        if (index === -1) this.children.push(child)
        else this.children.splice(index, 0, child)
    }

    removeJSXChild(child: JSXNode): void {
        const index = this.children.indexOf(child)
        if (index !== -1) this.children.splice(index, 1)
    }

    getJSXChildren(): readonly JSXNode[] {
        return this.children
    }
}

/** Text node; distinguished by class, so a `<text>` tag never collides with it. */
export class JSXTextNode implements JSXNode {
    constructor(public value: string) {}

    setJSXProperty(name: string): void {
        throw new Error(`JSXTextNode: cannot set property "${name}" on a text node`)
    }

    insertJSXChild(): void {
        throw new Error('JSXTextNode: a text node cannot have children')
    }

    removeJSXChild(): void {
        throw new Error('JSXTextNode: a text node cannot have children')
    }

    getJSXChildren(): readonly JSXNode[] {
        return NO_CHILDREN
    }
}

const factories = new Map<string, JSXElementFactory>()

/** Registers the engine node factory for an intrinsic tag. */
export function defineElement(tag: string, factory: JSXElementFactory): void {
    if (factories.has(tag)) {
        throw new Error(`defineElement: tag "${tag}" is already defined`)
    }
    factories.set(tag, factory)
}

/** Creates the node for a tag: the registered factory or `JSXElementNode`. */
export function createNode(tag: string): JSXNode {
    return factories.get(tag)?.(tag) ?? new JSXElementNode(tag)
}
