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
  "posts": *[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, publishedAt, updatedAt,
    "section": category->{title, "slug": slug.current},
    "author": author->{name, "slug": slug.current}
  },
  "sections": *[_type == "category" && defined(slug.current)] | order(order asc){title, "slug": slug.current, description},
  "authors": *[_type == "author" && defined(slug.current)] | order(isEditorial desc, name asc){name, "slug": slug.current, role},
  "pages": *[_type == "page" && defined(slug.current) && seo.noIndex != true]{title, "slug": slug.current, lede}
}`

/**
 * llms.txt (llmstxt.org): a plain-markdown map of the publication for AI
 * assistants and answer engines — what Cambridge Radar is, its sections,
 * every article with a one-line summary, and the people behind it.
 */
export async function GET() {
  const [settings, d] = await Promise.all([getSettings(), sanityFetch<Data>(query)])
  const line = (s?: string) => (s ? `: ${s.replace(/\s+/g, ' ').trim()}` : '')

  const md = [
    `# ${settings.title}`,
    '',
    `> ${settings.description ?? settings.tagline ?? ''}`.trim(),
    '',
    `${settings.title} is an independent analytical and editorial publication based in Cambridge, UK. It publishes long-form analysis on business, technology, AI, leadership, the economy and geopolitics by strategists, researchers and practitioners. All articles are free to read. Full text of every article: ${absolute('/llms-full.txt')}. RSS: ${absolute('/rss.xml')}.`,
    '',
    '## Sections',
    '',
    ...d.sections.map((s) => `- [${s.title}](${absolute(`/${s.slug}`)})${line(s.description)}`),
    '',
    '## Articles',
    '',
    ...d.posts.map(
      (p) =>
        `- [${p.title}](${absolute(postPath(p))})${line(
          [p.excerpt, p.author ? `By ${p.author.name}, ${p.publishedAt.slice(0, 10)}.` : p.publishedAt.slice(0, 10)]
            .filter(Boolean)
            .join(' '),
        )}`,
    ),
    '',
    '## Authors',
    '',
    ...d.authors.map((a) => `- [${a.name}](${absolute(`/authors/${a.slug}`)})${line(a.role)}`),
    '',
    '## About',
    '',
    ...d.pages.map((p) => `- [${p.title}](${absolute(`/${p.slug}`)})${line(p.lede)}`),
    settings.contactEmail ? `\nEditorial contact: ${settings.contactEmail}` : '',
    '',
  ].join('\n')

  return new Response(md, {headers: {'Content-Type': 'text/markdown; charset=utf-8'}})
}
