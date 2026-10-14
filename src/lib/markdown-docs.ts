import type {PortableTextBlock} from '@portabletext/react'

import {
  CONTRIBUTE_DESCRIPTION,
  FORMATS,
  HERO,
  STEPS,
  TOPIC_NOTES,
  WHY,
} from '@/components/contribute/content'

import {portableTextToMarkdown} from './markdown'
import type {MenuItem, Settings} from './sanity/types'
import {absolute, postPath, SITE_URL} from './utils'

/**
 * Markdown twins of the site's pages, for AI assistants and answer engines:
 * `<address>.md` and llms-full.txt. Same words as the HTML page, plain
 * structure, and always the canonical address, so a citation points at the
 * page people read.
 */

export type PostMd = {
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  updatedAt?: string
  tags?: string[]
  section?: {title: string; slug: string} | null
  author?: {name: string; slug: string; role?: string} | null
  body?: PortableTextBlock[]
}

const day = (iso: string) => iso.slice(0, 10)
const oneLine = (s?: string) => (s ?? '').replace(/\s+/g, ' ').trim()

/**
 * One article. `level` 1 is a page of its own (title is the h1); 2 is an entry
 * inside llms-full.txt, where headings sit one level lower and each entry is
 * closed by a rule.
 */
export function articleMarkdown(p: PostMd, settings: Settings, level: 1 | 2 = 1) {
  const url = absolute(postPath(p))
  const meta = [
    `URL: ${url}`,
    p.author && `Author: [${p.author.name}](${absolute(`/authors/${p.author.slug}`)})${p.author.role ? `, ${oneLine(p.author.role)}` : ''}`,
    p.section && `Section: [${p.section.title}](${absolute(`/${p.section.slug}`)})`,
    `Published: ${day(p.publishedAt)}${p.updatedAt ? ` · Updated: ${day(p.updatedAt)}` : ''}`,
    p.tags?.length && `Topics: ${p.tags.join(', ')}`,
  ].filter(Boolean)

  const out = [
    `${'#'.repeat(level)} ${p.title}`,
    '',
    p.excerpt ? `> ${oneLine(p.excerpt)}\n` : '',
    ...meta.map((m) => `- ${m}`),
    '',
    portableTextToMarkdown(p.body, level + 1),
    '',
  ]
  if (level === 1) {
    out.push(
      '---',
      '',
      `Published by [${settings.title}](${SITE_URL}). Canonical page: ${url}`,
      p.author ? `Cite as: ${p.author.name}, “${p.title}”, ${settings.title}, ${day(p.publishedAt)}, ${url}` : '',
      '',
    )
  } else {
    out.push('---', '')
  }
  return out.join('\n')
}

/** A static page (About, Contacts, Privacy Policy…). */
export function pageMarkdown(page: {title: string; lede?: string; body?: PortableTextBlock[]}, slug: string, settings: Settings) {
  return [
    `# ${page.title}`,
    '',
    page.lede ? `> ${oneLine(page.lede)}\n` : '',
    portableTextToMarkdown(page.body, 2),
    '',
    '---',
    '',
    `Part of [${settings.title}](${SITE_URL}). Canonical page: ${absolute(`/${slug}`)}`,
    '',
  ].join('\n')
}

type ListedPost = {title: string; slug: string; excerpt?: string; publishedAt: string; section?: {slug: string} | null; author?: string}

const postLine = (p: ListedPost) =>
  `- [${p.title}](${absolute(postPath(p))}): ${[oneLine(p.excerpt), `${p.author ? `By ${p.author}, ` : ''}${day(p.publishedAt)}.`].filter(Boolean).join(' ')}`

export function authorMarkdown(
  a: {
    name: string
    role?: string
    subtitle?: string
    expertise?: string
    country?: string
    industry?: string
    shortBio?: string
    bio?: PortableTextBlock[]
    links?: {network: string; url: string}[]
    posts?: ListedPost[]
  },
  slug: string,
  settings: Settings,
) {
  const facts = [
    a.role && `Role: ${oneLine(a.role)}`,
    a.expertise && `Expertise: ${oneLine(a.expertise)}`,
    a.industry && `Industry: ${oneLine(a.industry)}`,
    a.country && `Country: ${oneLine(a.country)}`,
  ].filter(Boolean)
  return [
    `# ${a.name}`,
    '',
    a.subtitle ? `> ${oneLine(a.subtitle)}\n` : a.shortBio ? `> ${oneLine(a.shortBio)}\n` : '',
    ...facts.map((f) => `- ${f}`),
    '',
    a.bio?.length ? portableTextToMarkdown(a.bio, 2) : '',
    '',
    a.links?.length ? ['## Profiles', '', ...a.links.map((l) => `- ${l.network}: ${l.url}`), ''].join('\n') : '',
    a.posts?.length ? ['## Articles', '', ...a.posts.map(postLine), ''].join('\n') : '',
    '---',
    '',
    `Author at [${settings.title}](${SITE_URL}). Canonical page: ${absolute(`/authors/${slug}`)}`,
    '',
  ].join('\n')
}

export function sectionMarkdown(s: {title: string; description?: string; posts?: ListedPost[]}, slug: string, settings: Settings) {
  return [
    `# ${s.title}`,
    '',
    s.description ? `> ${oneLine(s.description)}\n` : '',
    '## Articles',
    '',
    ...(s.posts ?? []).map(postLine),
    '',
    '---',
    '',
    `Section of [${settings.title}](${SITE_URL}). Canonical page: ${absolute(`/${slug}`)}`,
    '',
  ].join('\n')
}

/** /contribute is code, not CMS, so its Markdown comes from the same content module as the page. */
export function contributeMarkdown(sections: MenuItem[], settings: Settings) {
  return [
    `# ${HERO.title}`,
    '',
    `> ${HERO.lede}`,
    '',
    CONTRIBUTE_DESCRIPTION,
    '',
    '## Why publish with Cambridge Radar',
    '',
    ...WHY.map((w) => `- **${w.title}**: ${w.text}`),
    '',
    '## Four ways to publish',
    '',
    ...FORMATS.map((f) => `- **${f.title}**: ${f.text}`),
    '',
    '## Topics we cover',
    '',
    'We welcome original perspectives across our sections. If your idea sits between two of them, pitch it anyway.',
    '',
    ...sections.map((s) => `- [${s.title}](${absolute(`/${s.slug}`)})${TOPIC_NOTES[s.slug] ? `: ${TOPIC_NOTES[s.slug]}` : ''}`),
    '',
    '## From idea to publication',
    '',
    ...STEPS.map((s, i) => `${i + 1}. **${s.title}**: ${s.text}`),
    '',
    '## Pitch your idea',
    '',
    `Use the form at ${absolute('/contribute#pitch')}: say whether you write as an author or an organisation, add your name, email, a link to your LinkedIn profile or website, an optional format, and your proposed title or topic. An editor replies by email.`,
    settings.contactEmail ? `\nYou can also write to ${settings.contactEmail}.` : '',
    '',
    '---',
    '',
    `Part of [${settings.title}](${SITE_URL}). Canonical page: ${absolute('/contribute')}`,
    '',
  ].join('\n')
}
