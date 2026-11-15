/**
 * @global
 * Simple template string interpolation.
 *
 * Replaces `{{key}}` placeholders with values from the data object.
 * Supports nested paths like `{{user.name}}`.
 *
 * @param templateStr - Template string with `{{key}}` placeholders
 * @param data - Data object for interpolation
 * @returns Rendered template string
 * @example
 * ```typescript
 * template('Hello, {{name}}!', { name: 'World' })
 * // 'Hello, World!'
 *
 * template('{{user.name}} works at {{company.name}}', data)
 * // 'Alice works at Acme'
 * ```
 */
export function template(templateStr: string, data: Record<string, unknown>): string {
    return templateStr.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
        const keys = path.trim().split('.')
        let value: unknown = data

        for (const key of keys) {
            if (value == null || typeof value !== 'object') {
                return match
            }

            value = (value as Record<string, unknown>)[key]
        }

        if (value == null) {
            return match
        }

        return String(value)
    })
}
