import Link from 'next/link'

import {getLatest} from '@/lib/data'
import {cn, postPath} from '@/lib/utils'

/**
 * "Latest Articles" — the original site's sidebar widget: the ten newest
 * articles as plain headline links. Shown on articles, archives, authors,
 * pages and search, as on the old site.
 */
export async function LatestArticles({exclude, className}: {exclude?: string; className?: string}) {
  const posts = (await getLatest(11)).filter((p) => p._id !== exclude).slice(0, 10)
  if (!posts.length) return null
  return (
    <section aria-labelledby="latest-articles" className={className}>
      <h2 id="latest-articles" className="kicker border-t-2 border-rule-strong pt-3">
        Latest Articles
      </h2>
      <ul className="mt-4 divide-y divide-rule">
        {posts.map((post) => (
          <li key={post._id}>
            <Link href={postPath(post)} className={cn('t-ui block py-2.5 text-ink-2 transition-colors hover:text-ink')}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
