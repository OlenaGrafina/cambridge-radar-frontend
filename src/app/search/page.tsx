import type {Metadata} from 'next'

import {SearchIcon} from '@/components/icons'
import {StoryRow} from '@/components/story/Story'
import {getLatest} from '@/lib/data'
import {sanityFetchFresh} from '@/lib/sanity/client'
import {searchQuery} from '@/lib/sanity/queries'
import type {PostCard} from '@/lib/sanity/types'
import {pad} from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Search',
  robots: {index: false, follow: true},
  alternates: {canonical: '/search'},
}

type Props = {searchParams: Promise<{q?: string}>}

/** GROQ text match → wildcard terms, so "geopol" finds "geopolitics". */
function toMatch(q: string) {
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((t) => `${t.replace(/[*"\\]/g, '')}*`)
}

export default async function SearchPage({searchParams}: Props) {
  const {q = ''} = await searchParams
  const query = q.slice(0, 120)
  const terms = toMatch(query)
  const results = terms.length ? await sanityFetchFresh<PostCard[]>(searchQuery, {q: terms}).catch(() => []) : []
  const suggestions = !terms.length || !results.length ? await getLatest(5) : []

  return (
    <div className="shell">
      <header className="pt-page pb-8">
        <p className="meta">Search</p>
        <form action="/search" role="search" className="mt-6 flex items-center gap-4 border-b-2 border-rule-strong pb-3">
          <SearchIcon size={28} className="shrink-0 text-muted" />
          <label htmlFor="q" className="sr-only">
            Search Cambridge Radar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus
            placeholder="Search analysis, people, topics"
            className="t-h2 w-full min-w-0 bg-transparent outline-none placeholder:text-muted/60"
          />
          <button type="submit" className="btn btn-ink shrink-0">
            Search
          </button>
        </form>
        {terms.length > 0 && (
          <p className="meta mt-4" aria-live="polite">
            {pad(results.length)} {results.length === 1 ? 'result' : 'results'} for “{query}”
          </p>
        )}
      </header>

      {results.length > 0 && (
        <ul className="divide-y divide-rule">
          {results.map((post) => (
            <li key={post._id} className="py-6">
              <StoryRow post={post} showExcerpt />
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <section aria-labelledby="suggest" className="mt-6">
          <h2 id="suggest" className="kicker border-t border-rule pt-4">
            {terms.length ? 'Nothing matched. Latest analysis instead' : 'Latest analysis'}
          </h2>
          <ul className="divide-y divide-rule">
            {suggestions.map((post) => (
              <li key={post._id} className="py-6">
                <StoryRow post={post} showExcerpt />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
