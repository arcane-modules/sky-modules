/**
 * Hooks system for define.
 *
 * Allows reactive and schema packages to register their implementations
 * without creating direct dependencies on solid-js or other libraries.
 */

export type PropertyDescriptorHook = (wrappedSchema: unknown, key: PropertyKey, index: number) => PropertyDescriptor

export type PropertyDescriptorMapHook = (
    schema: Record<PropertyKey, unknown>
) => Record<PropertyKey, PropertyDescriptor>

let _propertyDescriptorHook: PropertyDescriptorHook | null = null
let _propertyDescriptorMapHook: PropertyDescriptorMapHook | null = null

export function registerPropertyDescriptorHook(hook: PropertyDescriptorHook): void {
    _propertyDescriptorHook = hook
}

export function registerPropertyDescriptorMapHook(hook: PropertyDescriptorMapHook): void {
    _propertyDescriptorMapHook = hook
}

export function getPropertyDescriptorHook(): PropertyDescriptorHook | null {
    return _propertyDescriptorHook
}

export function getPropertyDescriptorMapHook(): PropertyDescriptorMapHook | null {
    return _propertyDescriptorMapHook
}

export function createPropertyDescriptor(wrappedSchema: unknown, key: PropertyKey, index: number): PropertyDescriptor {
    if (_propertyDescriptorHook) {
        return _propertyDescriptorHook(wrappedSchema, key, index)
    }

    let value: unknown
    return {
        get(): unknown {
            return value
        },
        set(newValue: unknown): void {
            value = newValue
        },
        enumerable: true,
        configurable: true,
    }
}

export function createPropertyDescriptorMap(
    schema: Record<PropertyKey, unknown>
): Record<PropertyKey, PropertyDescriptor> {
    if (_propertyDescriptorMapHook) {
        return _propertyDescriptorMapHook(schema)
    }

    const map: Record<PropertyKey, PropertyDescriptor> = {}
    let index = 0

    for (const key of Object.keys(schema)) {
        map[key] = createPropertyDescriptor(schema[key], key, index++)
    }

    return map
}
