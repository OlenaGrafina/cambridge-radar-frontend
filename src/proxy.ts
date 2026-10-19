import {type NextFetchEvent, NextResponse, type NextRequest} from 'next/server'

import {
  authorSlugsQuery,
  pageSlugsQuery,
  postPathsQuery,
  sectionSlugsQuery,
  seriesSlugsQuery,
  tagListQuery,
} from '@/lib/sanity/queries'
import {PAGE_SIZE, slugify} from '@/lib/utils'

/**
 * Runs before every page request.
 *
 * 1. Redirects from Sanity (Studio → Переадресації) applied while the site runs,
 *    so a rule the editor adds, edits or deletes works within a minute, no deploy.
 *    Starts from the build-time snapshot (next.config → CR_REDIRECTS), so old
 *    WordPress addresses work from the very first request.
 * 2. Strips trailing slashes, in the same hop: /old/path/ → /new/path.
 * 3. Answers 404 for addresses that match no content (/wp-admin/setup.php,
 *    /.env, /made-up/path) before they reach a cached route. Otherwise each one
 *    renders a 404 that Vercel stores as an ISR write; bots send thousands, and
 *    the Hobby plan pauses the site at 200K writes a month.
 *
 * The rules and the list of existing slugs come from the Sanity CDN at most
 * once a minute per server instance.
 */

type Rule = {source: string; destination: string; permanent: boolean}
type Data = {
  redirects: Rule[]
  sections: {slug: string; total: number}[]
  pages: string[]
  posts: {slug: string; section?: string}[]
  authors: string[]
  series: string[]
  tags: (string | null)[]
}
type Known = {
  sections: Map<string, number>
  pages: Set<string>
  posts: Set<string>
  authors: Set<string>
  series: Set<string>
  tags: Set<string>
  total: number
}

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const QUERY = `{
  "redirects": *[_type == "redirect" && defined(source) && defined(destination)]{source, destination, "permanent": permanent != false},
  "sections": ${sectionSlugsQuery},
  "pages": ${pageSlugsQuery},
  "posts": ${postPathsQuery},
  "authors": ${authorSlugsQuery},
  "series": ${seriesSlugsQuery},
  "tags": ${tagListQuery}
}`
const TTL = 60_000

/** Routes with no slug in them. */
const FIXED = new Set(['/', '/all', '/authors', '/contribute', '/search', '/subscription', '/opengraph-image', '/missing'])
/** Files the app serves at the root; public/ files live under /contribute/. */
const FILES = new Set(['/robots.txt', '/sitemap.xml', '/rss.xml', '/llms.txt', '/llms-full.txt', '/manifest.webmanifest', '/icon.png', '/apple-icon.png', '/favicon.ico'])
const HAS_EXT = /\.[a-zA-Z0-9]+$/
const PAGE_N = /^[1-9]\d{0,3}$/

const norm = (path: string) => (path.replace(/\/+$/, '') || '/').toLowerCase()

function toMap(rules: Rule[]) {
  const map = new Map<string, Rule>()
  for (const rule of rules) if (norm(rule.source) !== norm(rule.destination)) map.set(norm(rule.source), rule)
  return map
}

let rules = toMap(JSON.parse(process.env.CR_REDIRECTS || '[]') as Rule[])
let known: Known | null = null
let fetchedAt = 0
let inflight: Promise<void> | null = null

async function load() {
  const url = `https://${PROJECT}.apicdn.sanity.io/v2025-02-19/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`
  const res = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(3000)})
  if (!res.ok) throw new Error(`Sanity ${res.status}`)
  const {result: d} = (await res.json()) as {result: Data}
  rules = toMap(d.redirects)
  known = {
    sections: new Map(d.sections.map((s) => [s.slug, s.total])),
    pages: new Set(d.pages),
    posts: new Set(d.posts.filter((p) => p.section).map((p) => p.slug)),
    authors: new Set(d.authors),
    series: new Set(d.series),
    tags: new Set(d.tags.filter((t): t is string => Boolean(t)).map(slugify)),
    total: d.posts.length,
  }
  fetchedAt = Date.now()
}

function refresh() {
  inflight ??= load()
    .catch((e) => {
      // Keep the last good data; try again in ~10 s.
      console.error('[proxy] refresh failed', e)
      fetchedAt = Date.now() - TTL + 10_000
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

const pageOk = (n: string, total: number) => PAGE_N.test(n) && Number(n) <= Math.max(1, Math.ceil(total / PAGE_SIZE))

/** Does this path (no trailing slash, no ".md") lead to content? */
function exists(path: string, k: Known): boolean {
  if (FIXED.has(path)) return true
  const s = path.slice(1).split('/')
  const [a, b, c, d] = s
  switch (s.length) {
    case 1:
      return k.sections.has(a) || k.pages.has(a)
    case 2:
      if (a === 'authors') return k.authors.has(b)
      if (a === 'series') return k.series.has(b)
      if (a === 'tag') return k.tags.has(b)
      return k.sections.has(a) && k.posts.has(b)
    case 3:
      if (a === 'all' && b === 'page') return pageOk(c, k.total)
      return b === 'page' && k.sections.has(a) && pageOk(c, k.sections.get(a)!)
    case 4:
      return a === 'tag' && c === 'page' && k.tags.has(b) && PAGE_N.test(d)
  }
  return false
}

/** Pages, their Markdown twins (/x.md, /md/x) and the app's own files. */
function routable(pathname: string, k: Known) {
  if (FILES.has(pathname) || pathname.startsWith('/contribute/')) return true
  if (pathname.startsWith('/md/')) return exists(pathname.slice(3), k)
  if (pathname.endsWith('.md')) return exists(pathname.slice(0, -3), k)
  if (HAS_EXT.test(pathname)) return false
  return exists(pathname, k)
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (Date.now() - fetchedAt > TTL) event.waitUntil(refresh())

  const {pathname, search} = request.nextUrl
  const rule = rules.get(norm(pathname))
  if (rule) {
    const target = new URL(rule.destination, request.url)
    if (!rule.destination.includes('?') && search) target.search = search
    return NextResponse.redirect(target, rule.permanent ? 308 : 307)
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    // A plain URL: NextURL would put the trailing slash back.
    const url = new URL(request.url)
    url.pathname = pathname.replace(/\/+$/, '')
    return NextResponse.redirect(url, 308)
  }

  // A fresh instance, or content published since the last refresh: look again
  // before calling it missing. If Sanity can't be reached, let the page decide.
  if (!known || (!routable(pathname, known) && Date.now() - fetchedAt > TTL)) await refresh()
  if (known && !routable(pathname, known)) {
    if (HAS_EXT.test(pathname) && !pathname.endsWith('.md')) {
      return new NextResponse('Not found', {status: 404, headers: {'Content-Type': 'text/plain; charset=utf-8'}})
    }
    return NextResponse.rewrite(new URL('/missing', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Everything except Next internals, API routes and Vercel's own endpoints.
  matcher: ['/((?!_next/|api/|_vercel/).*)'],
}
