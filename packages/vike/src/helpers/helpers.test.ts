/**
 * Tests for Vike helpers.
 */

import { describe, expect, test, vi } from 'vitest'

import callCumulativeHooks from './callCumulativeHooks'
import getCumulativeStrings from './getCumulativeStrings'
import getHeadSetting from './getHeadSetting'
import mergeTagAttributes from './mergeTagAttributes'

// Mock PageContext type for testing
interface MockPageContext {
    config?: Record<string, unknown>
    _configViaHook?: Record<string, unknown>
}

describe('vike/helpers', () => {
    describe('getHeadSetting', () => {
        test('returns undefined when no config', () => {
            const ctx: MockPageContext = {}
            const result = getHeadSetting(ctx as never, 'title')
            expect(result).toBeUndefined()
        })

        test('returns default value when setting not found', () => {
            const ctx: MockPageContext = { config: {} }
            const result = getHeadSetting(ctx as never, 'title', 'Default Title')
            expect(result).toBe('Default Title')
        })

        test('returns setting value from config', () => {
            const ctx: MockPageContext = {
                config: { title: 'My Page Title' },
            }
            const result = getHeadSetting(ctx as never, 'title')
            expect(result).toBe('My Page Title')
        })

        test('prioritizes _configViaHook over config', () => {
            const ctx: MockPageContext = {
                config: { title: 'Config Title' },
                _configViaHook: { title: 'Hook Title' },
            }
            const result = getHeadSetting(ctx as never, 'title')
            expect(result).toBe('Hook Title')
        })

        test('returns last non-empty value from cumulative array', () => {
            const ctx: MockPageContext = {
                config: { title: ['Base Title', 'Page Title', 'Final Title'] },
            }
            const result = getHeadSetting(ctx as never, 'title')
            expect(result).toBe('Final Title')
        })

        test('returns default when array has only empty values', () => {
            const ctx: MockPageContext = {
                config: { title: ['', null, undefined] },
            }
            const result = getHeadSetting(ctx as never, 'title', 'Default')
            expect(result).toBe('Default')
        })
    })

    describe('callCumulativeHooks', () => {
        test('returns undefined when no config', async () => {
            const ctx: MockPageContext = {}
            const result = await callCumulativeHooks(ctx as never, 'onBeforeRenderHtml')
            expect(result).toBeUndefined()
        })

        test('executes single hook and returns result', async () => {
            const hook = vi.fn().mockResolvedValue('hook-result')
            const ctx: MockPageContext = {
                config: { onBeforeRenderHtml: [hook] },
            }

            const result = await callCumulativeHooks(ctx as never, 'onBeforeRenderHtml', 'arg1')

            expect(hook).toHaveBeenCalledWith('arg1')
            expect(result).toBe('hook-result')
        })

        test('executes multiple hooks in sequence', async () => {
            const executionOrder: number[] = []

            const hook1 = vi.fn().mockImplementation(async () => {
                executionOrder.push(1)
                return 'result-1'
            })
            const hook2 = vi.fn().mockImplementation(async () => {
                executionOrder.push(2)
                return 'result-2'
            })

            const ctx: MockPageContext = {
                config: { onBeforeRenderHtml: [hook1, hook2] },
            }

            const result = await callCumulativeHooks(ctx as never, 'onBeforeRenderHtml')

            expect(executionOrder).toEqual([1, 2])
            expect(result).toBe('result-2')
        })

        test('skips non-function items in hooks array', async () => {
            const hook = vi.fn().mockResolvedValue('result')
            const ctx: MockPageContext = {
                config: { myHook: ['not-a-function', null, hook, undefined] },
            }

            const result = await callCumulativeHooks(ctx as never, 'myHook')

            expect(hook).toHaveBeenCalledOnce()
            expect(result).toBe('result')
        })
    })

    describe('mergeTagAttributes', () => {
        test('returns empty string when no config', () => {
            const ctx: MockPageContext = {}
            const result = mergeTagAttributes(ctx as never, 'htmlAttributes')
            expect(result).toBe('')
        })

        test('returns default attributes when no config', () => {
            const ctx: MockPageContext = {}
            const result = mergeTagAttributes(ctx as never, 'htmlAttributes', { lang: 'en' })
            expect(result).toBe('lang="en"')
        })

        test('config attributes override defaults', () => {
            const ctx: MockPageContext = {
                config: {
                    htmlAttributes: [{ lang: 'ru' }],
                },
            }
            const result = mergeTagAttributes(ctx as never, 'htmlAttributes', { lang: 'en' })
            expect(result).toBe('lang="ru"')
        })

        test('escapes quotes in attribute values', () => {
            const ctx: MockPageContext = {
                config: {
                    htmlAttributes: [{ 'data-value': 'say "hello"' }],
                },
            }
            const result = mergeTagAttributes(ctx as never, 'htmlAttributes')
            expect(result).toBe('data-value="say &quot;hello&quot;"')
        })

        test('filters out undefined and null values', () => {
            const ctx: MockPageContext = {
                config: {
                    htmlAttributes: [{ valid: 'yes', invalid: undefined, alsoInvalid: null }],
                },
            }
            const result = mergeTagAttributes(ctx as never, 'htmlAttributes')
            expect(result).toBe('valid="yes"')
        })
    })

    describe('getCumulativeStrings', () => {
        test('returns empty string when no config', () => {
            const ctx: MockPageContext = {}
            const result = getCumulativeStrings(ctx as never, 'bodyHtmlBegin')
            expect(result).toBe('')
        })

        test('joins string values with newline by default', () => {
            const ctx: MockPageContext = {
                config: {
                    bodyHtmlBegin: ['<script>a</script>', '<script>b</script>'],
                },
            }
            const result = getCumulativeStrings(ctx as never, 'bodyHtmlBegin')
            expect(result).toBe('<script>a</script>\n<script>b</script>')
        })

        test('uses custom separator', () => {
            const ctx: MockPageContext = {
                config: {
                    headTags: ['<meta />', '<link />'],
                },
            }
            const result = getCumulativeStrings(ctx as never, 'headTags', ' ')
            expect(result).toBe('<meta /> <link />')
        })

        test('filters out non-string values', () => {
            const ctx: MockPageContext = {
                config: {
                    bodyHtmlEnd: ['<div />', null, undefined, 123, '<span />', {}],
                },
            }
            const result = getCumulativeStrings(ctx as never, 'bodyHtmlEnd')
            expect(result).toBe('<div />\n<span />')
        })
    })
})
