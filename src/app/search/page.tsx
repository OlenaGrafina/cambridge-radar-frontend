import type {Metadata} from 'next'
import Link from 'next/link'

import {SearchTracker} from '@/components/analytics/SearchTracker'
import {SearchIcon} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {Pagination} from '@/components/layout/Pagination'
import {SanityImg} from '@/components/media/SanityImg'
import {LatestArticles} from '@/components/sidebar/LatestArticles'
import {StoryRow} from '@/components/story/Story'
import {sanityFetchFresh} from '@/lib/sanity/client'
import {searchOtherQuery, searchQuery} from '@/lib/sanity/queries'
import type {PostCard, SanityImage} from '@/lib/sanity/types'

type Props = {searchParams: Promise<{q?: string; page?: string}>}
type Other = {_id: string; title: string; slug: string; text?: string; photo?: SanityImage}
type Result = {kind: 'Post'; post: PostCard} | {kind: 'Page' | 'Profile'; item: Other; href: string}

const PER_PAGE = 10

export async function generateMetadata({searchParams}: Props): Promise<Metadata> {
  const {q = ''} = await searchParams
  return {
    title: q ? `You searched for ${q.slice(0, 120)}` : 'Search',
    robots: {index: false, follow: true},
    alternates: {canonical: '/search'},
  }
}

/** GROQ text match → wildcard terms, so "geopol" finds "geopolitics". */
function toMatch(q: string) {
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((t) => `${t.replace(/[*"\\]/g, '')}*`)
}

/**
 * Search, as on the original: "N search results for: q", posts, pages and
 * profiles in one list with a type label, ten per page, "Latest Articles"
 * alongside. The field stays on the page so a search can be refined.
 */
export default async function SearchPage({searchParams}: Props) {
  const {q = '', page: pageParam} = await searchParams
  const query = q.slice(0, 120)
  const terms = toMatch(query)

  const [posts, other] = terms.length
    ? await Promise.all([
        sanityFetchFresh<PostCard[]>(searchQuery, {q: terms}).catch(() => []),
        sanityFetchFresh<{pages: Other[]; sections: Other[]; authors: Other[]}>(searchOtherQuery, {q: terms}).catch(() => null),
      ])
    : [[], null]

  const results: Result[] = [
    ...posts.map((post) => ({kind: 'Post' as const, post})),
    ...(other?.sections ?? []).map((item) => ({kind: 'Page' as const, item, href: `/${item.slug}`})),
    ...(other?.pages ?? []).map((item) => ({kind: 'Page' as const, item, href: `/${item.slug}`})),
    ...(other?.authors ?? []).map((item) => ({kind: 'Profile' as const, item, href: `/authors/${item.slug}`})),
  ]

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1))
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const href = (n: number) => `/search?q=${encodeURIComponent(query)}${n > 1 ? `&page=${n}` : ''}`

  return (
    <div className="shell">
      <SearchTracker term={query} results={results.length} />
      <PageHeader
        crumbs={[{label: 'Home', href: '/'}, query ? {label: `You searched for ${query}`} : {label: 'Search'}]}
        title={terms.length ? `${results.length} search ${results.length === 1 ? 'result' : 'results'} for: ${query}` : 'Search'}
      />

      <div className="grid-12 gap-y-section">
        <div className="col-span-12 lg:col-span-8">
          <form action="/search" role="search" className="flex items-center gap-4 border-b-2 border-rule-strong pb-3">
            <SearchIcon size={24} className="shrink-0 text-muted" />
            <label htmlFor="q" className="sr-only">
              Search Cambridge Radar
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              autoFocus={!query}
              placeholder="Enter Keywords"
              className="t-h3 w-full min-w-0 bg-transparent outline-none placeholder:text-muted/60"
            />
            <button type="submit" className="btn btn-ink shrink-0">
              Search
            </button>
          </form>

          {shown.length > 0 && (
            <ul className="mt-4 divide-y divide-rule">
              {shown.map((r) =>
                r.kind === 'Post' ? (
                  <li key={r.post._id} className="py-6">
                    <p className="meta mb-2">Post</p>
                    <StoryRow post={r.post} showExcerpt />
                  </li>
                ) : (
                  <li key={r.item._id} className="py-6">
                    <article className="group relative grid grid-cols-[1fr_5.5rem] gap-4 sm:grid-cols-[1fr_7.5rem]">
                      <div className="min-w-0">
                        <p className="meta mb-2">{r.kind}</p>
                        <h3 className="t-h5">
                          <Link href={r.href} className="after:absolute after:inset-0 hover-line">
                            {r.item.title}
                          </Link>
                        </h3>
                        {r.item.text && <p className="t-body-sm mt-2 line-clamp-2 max-w-measure text-ink-2">{r.item.text}</p>}
                      </div>
                      {r.item.photo?.asset && <SanityImg image={r.item.photo} ratio={1} sizes="120px" alt={r.item.title} />}
                    </article>
                  </li>
                ),
              )}
            </ul>
          )}

          <Pagination page={page} pages={pages} href={href} />
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-rule">
          <LatestArticles />
        </aside>
      </div>
    </div>
  )
}
