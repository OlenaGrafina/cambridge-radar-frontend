import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {absolute, postPath} from '@/lib/utils'

export const revalidate = 3600

type Post = {
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  section?: {title: string; slug: string}
  author?: {name: string; role?: string}
  text: string
}

const query = /* groq */ `*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc){
  title, "slug": slug.current, excerpt, publishedAt,
  "section": category->{title, "slug": slug.current},
  "author": author->{name, role},
  "text": pt::text(body)
}`

/** Companion to llms.txt: the full text of every article as markdown. */
export async function GET() {
  const [settings, posts] = await Promise.all([getSettings(), sanityFetch<Post[]>(query)])
  const md = [
    `# ${settings.title} — full text`,
    '',
    `> Every published article, newest first. Source: ${absolute('/')}`,
    '',
    ...posts.flatMap((p) => [
      `## ${p.title}`,
      '',
      `URL: ${absolute(postPath(p))}`,
      `Section: ${p.section?.title ?? '—'} · Published: ${p.publishedAt.slice(0, 10)}${p.author ? ` · Author: ${p.author.name}${p.author.role ? ` (${p.author.role})` : ''}` : ''}`,
      '',
      p.excerpt ? `> ${p.excerpt}\n` : '',
      p.text,
      '',
      '---',
      '',
    ]),
  ].join('\n')
  return new Response(md, {headers: {'Content-Type': 'text/markdown; charset=utf-8'}})
}
