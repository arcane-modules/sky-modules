/**
 * Button component (Mitosis source)
 *
 * This file is transpiled to React, Vue, Solid, Svelte, Qwik, Angular
 *
 * @example React
 * ```tsx
 * import { Button } from '@sky-modules/universal/react'
 * <Button onClick={() => console.log('clicked')}>Click me</Button>
 * ```
 *
 * @example Vue
 * ```vue
 * <script setup>
 * import { Button } from '@sky-modules/universal/vue'
 * </script>
 *
 * <template>
 *   <Button @click="handleClick">Click me</Button>
 * </template>
 * ```
 */

import type { JSX } from '@solidjs/web'

/**
 * Props for Button component
 */
export type ButtonProps = {
    /** Button label */
    label?: string
    /** Click handler */
    onClick?: () => void
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    /** Disabled state */
    disabled?: boolean
    /** Loading state */
    loading?: boolean
    /** Full width */
    fullWidth?: boolean
}

/**
 * Button component
 *
 * Universal button that works across all frameworks via Fusion Components transpilation.
 *
 * @param props - Component props
 * @returns Button element
 */
export default function Button(props: ButtonProps): JSX.Element {
    const {
        label = 'Button',
        onClick,
        variant = 'primary',
        disabled = false,
        loading = false,
        fullWidth = false,
    } = props

    const buttonClass = fullWidth ? 'w-full' : ''
    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-accent',
    }[variant]

    const disabledClass = disabled || loading ? 'pointer-events-none opacity-50' : ''

    return (
        <button
            class={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors ${variantClasses} ${disabledClass} ${buttonClass}`}
            onClick={onClick}
            disabled={disabled || loading}
            type="button"
        >
            {loading ? (
                <span class="animate-spin">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                            fill="none"
                        />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </span>
            ) : (
                label
            )}
        </button>
    )
}
