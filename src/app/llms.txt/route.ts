import {CONTRIBUTE_DESCRIPTION} from '@/components/contribute/content'
import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import type {PostCard} from '@/lib/sanity/types'
import {absolute, postPath} from '@/lib/utils'

export const revalidate = 3600

type Data = {
  posts: (PostCard & {updatedAt?: string})[]
  sections: {title: string; slug: string; description?: string}[]
  authors: {name: string; slug: string; role?: string}[]
  pages: {title: string; slug: string; lede?: string}[]
}

const query = /* groq */ `{
  "posts": *[_type == "post" && defined(slug.current) && defined(category) && publishedAt <= now()] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, publishedAt, updatedAt,
    "section": category->{title, "slug": slug.current},
    "author": author->{name, "slug": slug.current}
  },
  "sections": *[_type == "category" && defined(slug.current)] | order(order asc){title, "slug": slug.current, description},
  "authors": *[_type == "author" && defined(slug.current)] | order(isEditorial desc, name asc){name, "slug": slug.current, role},
  "pages": *[_type == "page" && defined(slug.current) && seo.noIndex != true]{title, "slug": slug.current, lede}
}`

/**
 * llms.txt (llmstxt.org): a plain-Markdown map of the publication for AI
 * assistants and answer engines. Every link goes to the Markdown twin of the
 * page (the address plus ".md"), which names its canonical address, so an
 * assistant reads clean text and cites the page people read.
 */
export async function GET() {
  const [settings, d] = await Promise.all([getSettings(), sanityFetch<Data>(query)])
  const line = (s?: string) => (s ? `: ${s.replace(/\s+/g, ' ').trim()}` : '')
  const md = (path: string) => absolute(`${path}.md`)

  // Contribute is code, not a CMS page: describe it from the page's own words.
  const pages = d.pages.filter((p) => p.slug !== 'contribute')

  const out = [
    `# ${settings.title}`,
    '',
    `> ${settings.description ?? settings.tagline ?? ''}`.trim(),
    '',
    `${settings.title} is an independent analytical and editorial publication based in Cambridge, UK. It publishes long-form analysis on business, technology, AI, leadership, the economy and geopolitics by strategists, researchers and practitioners. All articles are free to read.`,
    '',
    `Every page has a Markdown version at its address plus ".md" (for example ${md('/business/some-article')}). Each one names its canonical page. The full text of every article is in a single file: ${absolute('/llms-full.txt')}.`,
    '',
    '## Sections',
    '',
    ...d.sections.map((s) => `- [${s.title}](${md(`/${s.slug}`)})${line(s.description)}`),
    '',
    '## Articles',
    '',
    ...d.posts.map(
      (p) =>
        `- [${p.title}](${md(postPath(p))})${line(
          [p.excerpt, p.author ? `By ${p.author.name}, ${p.publishedAt.slice(0, 10)}.` : p.publishedAt.slice(0, 10)].filter(Boolean).join(' '),
        )}`,
    ),
    '',
    '## Authors',
    '',
    ...d.authors.map((a) => `- [${a.name}](${md(`/authors/${a.slug}`)})${line(a.role)}`),
    '',
    '## About and contributing',
    '',
    `- [Write for ${settings.title}](${md('/contribute')})${line(CONTRIBUTE_DESCRIPTION)}`,
    ...pages.map((p) => `- [${p.title}](${md(`/${p.slug}`)})${line(p.lede)}`),
    settings.contactEmail ? `\nEditorial contact: ${settings.contactEmail}` : '',
    '',
    '## Optional',
    '',
    `- [Full text of every article](${absolute('/llms-full.txt')}): all articles in one Markdown file`,
    `- [RSS feed](${absolute('/rss.xml')}): the newest articles`,
    `- [Sitemap](${absolute('/sitemap.xml')}): every public address`,
    '',
  ].join('\n')

  return new Response(out, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
