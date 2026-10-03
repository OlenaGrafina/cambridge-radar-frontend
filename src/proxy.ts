import {type NextFetchEvent, NextResponse, type NextRequest} from 'next/server'

/**
 * Redirects from Sanity (Studio → Переадресації) applied while the site runs,
 * so a rule the editor adds, edits or deletes works within a minute — no deploy.
 *
 * - Starts from the build-time snapshot (next.config → CR_REDIRECTS), so old
 *   WordPress addresses work from the very first request.
 * - Refreshes from the Sanity CDN at most once a minute per server instance.
 * - Also strips trailing slashes, in the same hop: /old/path/ → /new/path.
 */

type Rule = {source: string; destination: string; permanent: boolean}

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const QUERY = '*[_type == "redirect" && defined(source) && defined(destination)]{source, destination, "permanent": permanent != false}'
const TTL = 60_000

const norm = (path: string) => (path.replace(/\/+$/, '') || '/').toLowerCase()

function toMap(rules: Rule[]) {
  const map = new Map<string, Rule>()
  for (const rule of rules) if (norm(rule.source) !== norm(rule.destination)) map.set(norm(rule.source), rule)
  return map
}

let rules = toMap(JSON.parse(process.env.CR_REDIRECTS || '[]') as Rule[])
let fetchedAt = 0
let inflight: Promise<void> | null = null

async function refresh() {
  const url = `https://${PROJECT}.apicdn.sanity.io/v2025-02-19/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`
  const res = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(3000)})
  if (!res.ok) throw new Error(`Sanity ${res.status}`)
  const {result} = (await res.json()) as {result: Rule[]}
  rules = toMap(result)
  fetchedAt = Date.now()
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (Date.now() - fetchedAt > TTL && !inflight) {
    inflight = refresh()
      .catch((e) => {
        // Keep the last good rules; try again in ~10 s.
        console.error('[redirects] refresh failed', e)
        fetchedAt = Date.now() - TTL + 10_000
      })
      .finally(() => {
        inflight = null
      })
    event.waitUntil(inflight)
  }

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

  return NextResponse.next()
}

export const config = {
  // Pages only: not Next internals, API routes or files with an extension.
  matcher: ['/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
}
