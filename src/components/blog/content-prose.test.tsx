import { describe, expect, it } from 'vitest'
import { renderMdx } from './content-prose'
import { extractTableOfContents } from '@/lib/toc'

describe('server MDX rendering', () => {
 it('renders GFM tables and strike-through as HTML', async () => {
  const html = await renderMdx('~~deprecated~~\n\n| 天气 | 效果 |\n| --- | --- |\n| 烈日 | 炎热 |')
  expect(html).toContain('<del>deprecated</del>')
  expect(html).toContain('<table>')
  expect(html).toContain('<td>炎热</td>')
 })
 it('retains heading IDs, math, highlighted code and a copy payload', async () => {
  const source = '## 重复\n\n## 重复\n\n## 公式 $x^2$\n\n$x^2$\n\n```js\nconst value = 1\n```'
  const html = await renderMdx(source)
  for (const item of extractTableOfContents(source)) expect(html).toContain(`id="${item.id}"`)
  expect(html).toContain('katex')
  expect(html).toContain('data-copy-code="const value = 1"')
  expect(html).toContain('data-language="js"')
 })
 it('resets heading state when reusing compiled content', async () => {
  expect(await renderMdx('## 同名\n\n## 同名')).toBe(await renderMdx('## 同名\n\n## 同名'))
 })
})
