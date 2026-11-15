/**
 * @global
 * Measure and compare performance of multiple code variations.
 *
 * @param times - Number of iterations per variation
 * @param cyclesCount - Number of test cycles
 * @param variations - Array of [name, callback] tuples
 * @example
 * ```typescript
 * measurePerformance(1000, 5, [
 *     ['Array.push', () => {
 *         const arr: number[] = []
 *         data.forEach(x => arr.push(x))
 *     }],
 *     ['Spread operator', () => {
 *         const arr = [...data]
 *     }],
 * ])
 * ```
 */
export function measurePerformance(
    times: number,
    cyclesCount: number,
    variations: [name: string, callback: (iteration: number) => void][]
): void {
    const results: Record<number, number> = {}

    for (let i = 0; i < cyclesCount; i++) {
        console.log(`Cycle ${i + 1}`)

        for (let j = 0; j < variations.length; j++) {
            const variation = variations[j]
            if (!variation) continue
            const [name, callback] = variation
            console.log(name)

            const time = Date.now()

            for (let k = 0; k < times; ++k) {
                callback(k + 1)
            }

            const deltaTime = Date.now() - time
            results[j] = (results[j] ?? 0) + deltaTime
            console.log(`${deltaTime}ms\n`)
        }
    }

    for (let i = 0; i < variations.length; i++) {
        const variation = variations[i]
        const name = variation?.[0]
        const avg = results[i]
        if (name && avg !== undefined) {
            console.log(`${name}: ${Math.floor(avg / cyclesCount)}ms`)
        }
    }
}
