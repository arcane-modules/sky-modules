/** Component function: receives props and returns anything the renderer understands. */
type ComponentFunction = (props: never) => unknown

/** Component class. */
type ComponentClass = abstract new (props: never) => unknown

/** What a JSX element can be: an intrinsic tag name, a function component or a class component. */
export type ElementType = string | ComponentFunction | ComponentClass
