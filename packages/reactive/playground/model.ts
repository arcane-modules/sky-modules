import { number, reactiveArray, SignalLamp, string, validate } from '@sky-modules/reactive'

/** Player with reactive, validated properties. Decorators are applied by hand to avoid compiler flags. */
export class Player {
    declare health: number
    declare name: string
    readonly lamp: SignalLamp

    constructor() {
        this.lamp = new SignalLamp(this as unknown as Record<string, unknown>)
        this.health = 100
        this.name = 'Hero'
    }
}

number.min(0, 'Health must be at least 0').max(100, 'Health must be at most 100')(Player.prototype, 'health')
string.nonEmpty('Name cannot be empty')(Player.prototype, 'name')

export function validatePlayer(player: Player): string[] {
    return validate(player).errors.map((error) => `${error.path}: ${error.message}`)
}

export function createInventory(onChange: (description: string) => void): ReturnType<typeof reactiveArray<string>> {
    return reactiveArray<string>([], (event) => onChange(JSON.stringify(event)))
}
