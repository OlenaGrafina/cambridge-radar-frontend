import type {PortableTextBlock} from '@portabletext/react'

import {absolute} from './utils'

type Mark = {_key: string; _type: string; href?: string}
type Span = {_type: string; text?: string; marks?: string[]}
type Block = {
  _type: string
  style?: string
  listItem?: string
  level?: number
  children?: Span[]
  markDefs?: Mark[]
  text?: string
  attribution?: string
  url?: string
  caption?: string
  credit?: string
  alt?: string
  asset?: {url?: string}
}

const link = (href: string) => (href.startsWith('/') ? absolute(href) : href)

/** Inline text of one block with bold, italic, code and links. */
function inline(block: Block) {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]))
  return (block.children ?? [])
    .map((child) => {
      if (child._type !== 'span' || !child.text) return ''
      const text = child.text.replace(/ /g, ' ')
      const core = text.trim()
      if (!core) return text
      // Markdown markers must hug the words: spaces stay outside them.
      let out = core
      for (const m of child.marks ?? []) {
        if (m === 'strong') out = `**${out}**`
        else if (m === 'em') out = `*${out}*`
        else if (m === 'code') out = `\`${out}\``
        else {
          const def = defs.get(m)
          if (def?._type === 'link' && def.href) out = `[${out}](${link(def.href)})`
        }
      }
      return text.slice(0, text.indexOf(core)) + out + text.slice(text.indexOf(core) + core.length)
    })
    .join('')
}

/**
 * Portable Text → Markdown. `headingBase` is the level an h2 gets: 2 for a
 * page of its own (the title is the h1), 3 inside llms-full.txt (each article
 * is an h2 there). Articles imported from WordPress often have h3s only, so
 * with no h2 the h3s take the h2 level, exactly as the page does.
 */
export function portableTextToMarkdown(blocks: PortableTextBlock[] = [], headingBase = 2): string {
  const list = blocks as unknown as Block[]
  const isBlock = (b: Block, style: string) => b._type === 'block' && b.style === style
  const promote = !list.some((b) => isBlock(b, 'h2')) && list.some((b) => isBlock(b, 'h3'))
  const levelOf = (style: string) => {
    const n = style === 'h1' ? 2 : Number(style.slice(1))
    return Math.min(6, headingBase + (n - 2) - (promote ? 1 : 0))
  }

  const parts: {md: string; item: boolean}[] = []
  let numbers: number[] = []

  for (const b of list) {
    if (b._type === 'block') {
      const text = inline(b).trim()
      if (!text) continue
      if (b.listItem) {
        const depth = Math.max(1, b.level ?? 1)
        numbers.length = depth
        numbers[depth - 1] = (numbers[depth - 1] ?? 0) + 1
        const marker = b.listItem === 'number' ? `${numbers[depth - 1]}.` : '-'
        parts.push({md: `${'  '.repeat(depth - 1)}${marker} ${text}`, item: true})
        continue
      }
      numbers = []
      const style = b.style ?? 'normal'
      if (/^h[1-6]$/.test(style)) parts.push({md: `${'#'.repeat(levelOf(style))} ${text.replace(/:$/, '')}`, item: false})
      else if (style === 'blockquote') parts.push({md: text.split('\n').map((l) => `> ${l}`).join('\n'), item: false})
      else parts.push({md: text, item: false})
    } else if (b._type === 'figure') {
      numbers = []
      const url = b.asset?.url
      if (!url) continue
      const alt = (b.alt || b.caption || '').replace(/\s+/g, ' ').trim()
      const credit = [b.caption, b.credit].filter(Boolean).join(' · ')
      parts.push({md: `![${alt}](${url}?w=1600&auto=format)${credit ? `\n*${credit}*` : ''}`, item: false})
    } else if (b._type === 'pullQuote' && b.text) {
      numbers = []
      parts.push({md: `> “${b.text}”${b.attribution ? `\n> — ${b.attribution}` : ''}`, item: false})
    } else if (b._type === 'embed' && b.url) {
      numbers = []
      parts.push({md: `[${b.caption || b.url}](${b.url})`, item: false})
    } else if (b._type === 'divider') {
      numbers = []
      parts.push({md: '---', item: false})
    }
  }

  return parts.reduce((acc, p, i) => (i === 0 ? p.md : acc + (p.item && parts[i - 1].item ? '\n' : '\n\n') + p.md), '')
}
