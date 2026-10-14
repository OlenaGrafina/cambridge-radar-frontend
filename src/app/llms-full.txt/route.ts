import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {markdownPostsQuery} from '@/lib/sanity/queries'
import {articleMarkdown, type PostMd} from '@/lib/markdown-docs'
import {absolute} from '@/lib/utils'

export const revalidate = 3600

/**
 * Companion to llms.txt: every published article in full, as Markdown with its
 * headings, lists, links and figures, newest first. One request gives an
 * assistant the whole publication; each entry names its canonical address.
 */
export async function GET() {
  const [settings, posts] = await Promise.all([getSettings(), sanityFetch<PostMd[]>(markdownPostsQuery)])
  const md = [
    `# ${settings.title}: full text`,
    '',
    `> ${posts.length} articles, newest first. Index: ${absolute('/llms.txt')}. Every page also has a Markdown twin at its address plus ".md".`,
    '',
    ...posts.map((p) => articleMarkdown(p, settings, 2)),
  ].join('\n')
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
