import Link from 'next/link'

import {StoryIndex} from '@/components/story/Story'
import {getLatest} from '@/lib/data'

export default async function NotFound() {
  const latest = await getLatest(5).catch(() => [])
  return (
    <div className="shell grid gap-14 py-16 md:grid-cols-12 md:py-24">
      <div className="md:col-span-7">
        <p className="meta">Error 404 · Signal lost</p>
        <h1 className="display mt-6 text-[3.5rem] md:text-[6rem]">This page is off the radar.</h1>
        <p className="mt-6 max-w-lg font-serif text-[1.25rem] leading-relaxed text-ink-2">
          The address may have changed when we moved to the new site. Try search, or start from the front page.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-ink">
            Front page
          </Link>
          <Link href="/search" className="btn btn-ghost">
            Search
          </Link>
        </div>
      </div>
      {latest.length > 0 && (
        <aside className="md:col-span-4 md:col-start-9">
          <p className="kicker border-t-2 border-rule-strong pt-3">Latest</p>
          <ol className="mt-5 divide-y divide-rule">
            {latest.map((post, i) => (
              <li key={post._id} className="py-4 first:pt-0">
                <StoryIndex post={post} index={i + 1} />
              </li>
            ))}
          </ol>
        </aside>
      )}
    </div>
  )
}
