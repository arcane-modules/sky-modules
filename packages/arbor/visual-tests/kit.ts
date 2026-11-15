/**
 * Visual Test Kit — Split TUI
 *
 * Left panel: scrollable scenario menu (↑↓ select, Enter run, q quit)
 * Right panel: step-by-step visualization
 *
 * Generic — any project can use.
 */
import * as readline from 'node:readline'

// ── Types ────────────────────────────────────────────────────────────────

export type StepCtx = {
    /** Update right panel content. */
    show(title: string, content: string, extra?: string): void
    /** Wait for key. Returns 'next' | 'quit'. */
    pause(): Promise<'next' | 'quit'>
}

export type Scenario = { name: string; run(ctx: StepCtx): Promise<void> }

// ── Terminal dimensions ──────────────────────────────────────────────────

function termSize(): { cols: number; rows: number } {
    return { cols: process.stdout.columns || 80, rows: process.stdout.rows || 24 }
}

// ── ANSI helpers ─────────────────────────────────────────────────────────

const ESC = '\x1b'
const CSI = `${ESC}[`
const ANSI_PATTERN = new RegExp(`${ESC}\\[[0-9;]*m`, 'g')
const HOME = CSI + 'H'
const CLEAR = CSI + '2J' + HOME
const HIDE_CURSOR = CSI + '?25l'
const SHOW_CURSOR = CSI + '?25h'
const SGR = (n: number) => CSI + n + 'm'
const BOLD = SGR(1)
const DIM = SGR(2)
const RESET = SGR(0)
const CYAN = SGR(36)
const WHITE_BG = SGR(47) + SGR(30) // white bg, black text

function moveTo(row: number, col: number): string {
    return CSI + row + ';' + col + 'H'
}

function drawHR(y: number, x: number, w: number, char = '─'): string {
    return moveTo(y, x) + DIM + char.repeat(w) + RESET
}

function drawVertical(y: number, x: number, h: number): string {
    let out = ''
    for (let i = 0; i < h; i++) out += moveTo(y + i, x) + DIM + '│' + RESET
    return out
}

function stripAnsi(s: string): string {
    return s.replace(ANSI_PATTERN, '')
}

function padRight(s: string, n: number): string {
    const visible = stripAnsi(s)
    return s + ' '.repeat(Math.max(0, n - visible.length))
}

function truncate(s: string, n: number): string {
    const visible = stripAnsi(s)
    if (visible.length <= n) return s
    return s.slice(0, n - 1) + '…'
}

// ── Split TUI ────────────────────────────────────────────────────────────

export async function splitRunner(scenarios: Scenario[], title = 'Visual Tests'): Promise<void> {
    const stdin = process.stdin
    if (!stdin.isTTY) {
        // Fallback: run all non-interactively
        for (const s of scenarios) {
            const steps: string[] = []
            await s.run({
                show(t, c, e) {
                    steps.push(`${t}\n${c}${e ? '\n' + e : ''}`)
                },
                async pause() {
                    return 'next'
                },
            })
            console.log(steps.join('\n\n'))
        }
        return
    }

    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    const rl = readline.createInterface({ input: stdin })

    let rightTitle = ''
    let rightContent = ''
    let rightExtra = ''
    let selected = 0
    let running = false
    let quit = false
    let menuScroll = 0

    // Split: left = 30% of cols, min 25
    const updateLayout = () => {
        const { cols, rows } = termSize()
        return {
            leftW: Math.max(25, Math.floor(cols * 0.3)),
            rows: rows - 1, // bottom status bar
        }
    }

    function stepCtx(): StepCtx {
        return {
            show(t, c, e = '') {
                rightTitle = t
                rightContent = c
                rightExtra = e
                draw()
            },
            async pause() {
                draw()
                return new Promise((resolve) => {
                    const handler = (key: string) => {
                        if (key === '\r' || key === '\n') {
                            // Enter
                            stdin.removeListener('data', handler)
                            resolve('next')
                        } else if (key === 'q' || key === '\x1b') {
                            // q or Esc
                            stdin.removeListener('data', handler)
                            resolve('quit')
                        }
                    }
                    stdin.on('data', handler)
                })
            },
        }
    }

    function draw(): void {
        const { leftW, rows } = updateLayout()
        const rightX = leftW + 1
        const rightW = termSize().cols - rightX

        let out = HIDE_CURSOR

        // ── Left panel ────────────────────────────────────────────────
        const visibleRows = rows - 4 // header + footer

        // Adjust scroll
        if (selected < menuScroll) menuScroll = selected
        if (selected >= menuScroll + visibleRows) menuScroll = selected - visibleRows + 1
        menuScroll = Math.max(0, Math.min(menuScroll, Math.max(0, scenarios.length - visibleRows)))

        // Header
        out += moveTo(1, 1) + BOLD + CYAN + ' ' + title + ' ' + RESET

        // Menu items
        const maxNameW = leftW - 6 // [N] + space
        for (let i = 0; i < visibleRows && menuScroll + i < scenarios.length; i++) {
            const idx = menuScroll + i
            const s = scenarios[idx]!
            const isSel = idx === selected
            const prefix = isSel ? ' ▶' : '  '
            const num = String(idx + 1).padStart(2)
            const name = truncate(s.name, maxNameW)
            const line = prefix + '[' + num + '] ' + padRight(name, maxNameW)

            out += moveTo(3 + i, 1)
            if (isSel) {
                out += WHITE_BG + line + RESET
            } else {
                out += line
            }
        }

        // Scroll indicators
        if (menuScroll > 0) out += moveTo(2, leftW - 2) + DIM + '▲' + RESET
        if (menuScroll + visibleRows < scenarios.length) out += moveTo(rows - 1, leftW - 2) + DIM + '▼' + RESET

        // ── Divider ───────────────────────────────────────────────────
        out += drawVertical(1, leftW, rows)

        // ── Right panel ───────────────────────────────────────────────
        out += moveTo(1, rightX) + BOLD + ' ' + rightTitle + RESET
        out += drawHR(2, rightX, rightW)

        // Content
        const contentLines = rightContent.split('\n')
        const maxContentRows = rows - 5 // title + hr + footer + extra
        const showLines = contentLines.slice(0, maxContentRows)
        for (let i = 0; i < showLines.length; i++) {
            const line = truncate(showLines[i]!, rightW)
            out += moveTo(3 + i, rightX) + line
        }
        if (contentLines.length > maxContentRows) {
            out += moveTo(3 + maxContentRows, rightX) + DIM + '…' + RESET
        }

        // Extra
        if (rightExtra) {
            const extraLines = rightExtra.split('\n')
            for (let i = 0; i < Math.min(extraLines.length, 3); i++) {
                const line = truncate(extraLines[i]!, rightW)
                out += moveTo(rows - 4 + i, rightX) + DIM + line + RESET
            }
        }

        // ── Status bar ────────────────────────────────────────────────
        const status = running
            ? ' [Enter] next step | [q/Esc] back to menu '
            : ' [↑↓] navigate | [Enter] run | [q] quit '
        out += moveTo(rows, 1) + DIM + status.padEnd(termSize().cols) + RESET

        // ── Clean right panel beyond content ──────────────────────────
        const clearStart = 3 + showLines.length
        for (let i = clearStart; i <= rows; i++) {
            out += moveTo(i, rightX) + ' '.repeat(rightW)
        }

        out += SHOW_CURSOR
        process.stdout.write(out)
    }

    function drawMenu(): void {
        running = false
        rightTitle = 'Select a scenario to begin'
        rightContent = `
  Use ↑↓ to navigate, Enter to run.

  ${scenarios.map((s, i) => `  [${i + 1}] ${s.name}`).join('\n')}
`.trim()
        rightExtra = ''
        draw()
    }

    drawMenu()

    // Key handler
    stdin.on('data', async (key: Buffer | string) => {
        const k = key.toString()

        if (running) return // handled by pause()

        if (k === '\x1b[A' || k === 'k') {
            // Up
            selected = Math.max(0, selected - 1)
            draw()
        } else if (k === '\x1b[B' || k === 'j') {
            // Down
            selected = Math.min(scenarios.length - 1, selected + 1)
            draw()
        } else if (k === '\r' || k === '\n') {
            // Enter
            running = true
            draw() // show "running" status
            await scenarios[selected]!.run(stepCtx())
            running = false
            drawMenu()
        } else if (k === 'q' || k === '\x03') {
            // q or Ctrl-C
            quit = true
            stdin.setRawMode(false)
            rl.close()
            process.stdout.write(CLEAR + SHOW_CURSOR)
        }
    })

    // Wait for quit
    await new Promise<void>((resolve) => {
        const check = setInterval(() => {
            if (quit) {
                clearInterval(check)
                resolve()
            }
        }, 100)
    })

    process.stdout.write(CLEAR + SHOW_CURSOR)
}
