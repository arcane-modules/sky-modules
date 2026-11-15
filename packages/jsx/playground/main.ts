import { runDemos } from './model'

const container = document.getElementById('demos')
if (!container) throw new Error('Missing element #demos')

for (const demo of runDemos()) {
    const title = document.createElement('h3')
    title.textContent = demo.title

    const output = document.createElement('pre')
    output.textContent = demo.output

    container.append(title, output)
}
