import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {
  markdownAuthorQuery,
  markdownPageQuery,
  markdownPostQuery,
  markdownSectionQuery,
} from '@/lib/sanity/queries'
import {
  articleMarkdown,
  authorMarkdown,
  contributeMarkdown,
  pageMarkdown,
  sectionMarkdown,
  type PostMd,
} from '@/lib/markdown-docs'
import {absolute, postPath} from '@/lib/utils'

export const revalidate = 3600

type Params = {params: Promise<{path: string[]}>}

const headers = (canonical: string) => ({
  'Content-Type': 'text/markdown; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  // Search engines fold this copy into the page people read.
  Link: `<${canonical}>; rel="canonical"`,
})

const notFound = () =>
  new Response('# Not found\n\nThere is no page at this address. The index of everything is at /llms.txt.\n', {
    status: 404,
    headers: {'Content-Type': 'text/markdown; charset=utf-8'},
  })

/**
 * The Markdown twin of a page: any address plus ".md" (next.config rewrites
 * `/business/some-article.md` to here). Articles, sections, authors, static
 * pages and /contribute. llms.txt lists them.
 */
export async function GET(_req: Request, {params}: Params) {
  const {path} = await params
  const settings = await getSettings()
  const ok = (md: string, canonical: string) => new Response(md, {headers: headers(canonical)})

  if (path.length === 2 && path[0] === 'authors') {
    const author = await sanityFetch<Parameters<typeof authorMarkdown>[0] | null>(markdownAuthorQuery, {slug: path[1]}).catch(() => null)
    return author ? ok(authorMarkdown(author, path[1], settings), absolute(`/authors/${path[1]}`)) : notFound()
  }

  if (path.length === 2) {
    const post = await sanityFetch<PostMd | null>(markdownPostQuery, {slug: path[1]}).catch(() => null)
    return post ? ok(articleMarkdown(post, settings), absolute(postPath(post))) : notFound()
  }

  if (path.length === 1) {
    const slug = path[0]
    if (slug === 'contribute') {
      return ok(contributeMarkdown((settings.mainMenu ?? []).filter(Boolean), settings), absolute('/contribute'))
    }
    const section = await sanityFetch<Parameters<typeof sectionMarkdown>[0] | null>(markdownSectionQuery, {slug}).catch(() => null)
    if (section) return ok(sectionMarkdown(section, slug, settings), absolute(`/${slug}`))
    const page = await sanityFetch<Parameters<typeof pageMarkdown>[0] | null>(markdownPageQuery, {slug}).catch(() => null)
    if (page) return ok(pageMarkdown(page, slug, settings), absolute(`/${slug}`))
  }

  return notFound()
}
