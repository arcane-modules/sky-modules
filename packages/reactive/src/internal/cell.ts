import { createSignal } from 'solid-js'

/**
 * Reactive storage for one property.
 *
 * Solid 2 makes a signal write visible to reads only after `flush()`, and treats a
 * function passed to `createSignal` as a computation. A cell keeps the value itself,
 * so a read right after a write returns the new value, and uses a signal only as a
 * version counter for dependency tracking and batched notifications.
 */
export interface ReactiveCell {
    /** Returns the current value and subscribes the running computation. */
    read(): unknown
    /** Returns the current value without subscribing. */
    peek(): unknown
    /** Stores the value; notifies subscribers when it differs from the current one. */
    write(value: unknown): void
}

export function createCell(initial: unknown): ReactiveCell {
    let current = initial
    let version = 0
    // Model state may be written from effects; Solid 2 forbids that in dev without ownedWrite
    const [track, setVersion] = createSignal(version, { ownedWrite: true })

    return {
        read(): unknown {
            track()
            return current
        },

        peek(): unknown {
            return current
        },

        write(value: unknown): void {
            if (value === current) return
            current = value
            version += 1
            setVersion(version)
        },
    }
}
