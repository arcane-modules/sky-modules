import { createInventory, Player, validatePlayer } from './model'

function requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id)
    if (!element) throw new Error(`Missing element #${id}`)
    return element as T
}

const healthInput = requireElement<HTMLInputElement>('health')
const nameInput = requireElement<HTMLInputElement>('name')
const errorsElement = requireElement<HTMLDivElement>('errors')
const deltasElement = requireElement<HTMLPreElement>('deltas')
const inventoryElement = requireElement<HTMLPreElement>('inventory')

const player = new Player()
healthInput.value = String(player.health)
nameInput.value = player.name

function showErrors(): void {
    errorsElement.textContent = validatePlayer(player).join('; ')
}

player.lamp.onSync((delta) => {
    deltasElement.textContent += `${JSON.stringify(delta)}\n`
})

healthInput.addEventListener('input', () => {
    player.health = Number(healthInput.value)
    showErrors()
})

nameInput.addEventListener('input', () => {
    player.name = nameInput.value
    showErrors()
})

const inventory = createInventory((description) => {
    inventoryElement.textContent = `${description}\n${inventoryElement.textContent ?? ''}`
})

let counter = 0
requireElement<HTMLButtonElement>('push').addEventListener('click', () => inventory.push(`item ${++counter}`))
requireElement<HTMLButtonElement>('pop').addEventListener('click', () => inventory.pop())
requireElement<HTMLButtonElement>('clear').addEventListener('click', () => inventory.clear())
