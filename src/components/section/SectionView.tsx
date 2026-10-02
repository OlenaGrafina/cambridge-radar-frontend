import Link from 'next/link'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {Reveal} from '@/components/motion/Reveal'
import {StoryCard, StoryWide} from '@/components/story/Story'
import type {PostCard, Section} from '@/lib/sanity/types'
import {cn, pad} from '@/lib/utils'

export const PAGE_SIZE = 9

export function SectionView({
  section,
  posts,
  page,
  total,
}: {
  section: Section
  posts: PostCard[]
  page: number
  total: number
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const [first, ...rest] = posts
  const base = `/${section.slug}`
  const href = (n: number) => (n <= 1 ? base : `${base}/page/${n}`)

  return (
    <div className="shell">
      <header className="rise pt-10 pb-10 md:pt-16 md:pb-14">
        <p className="meta flex items-center gap-3">
          <Link href="/" className="hover:text-ink">
            Cambridge Radar
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Section</span>
        </p>
        <div className="mt-6 flex flex-col gap-6 border-b border-rule-strong pb-8 md:flex-row md:items-end md:justify-between">
          <h1 className="display text-[3.5rem] md:text-[6.5rem] lg:text-[8rem]">{section.title}</h1>
          <p className="meta shrink-0 md:pb-4">
            {pad(total)} {total === 1 ? 'article' : 'articles'}
            {pages > 1 && ` · page ${page} of ${pages}`}
          </p>
        </div>
        {section.description && (
          <p className="mt-6 max-w-2xl font-serif text-[1.25rem] leading-relaxed text-ink-2">{section.description}</p>
        )}
      </header>

      {!first && <p className="py-20 font-serif text-xl text-muted">No articles in this section yet.</p>}

      {first && page === 1 && (
        <div className="rise" style={{'--i': 1} as React.CSSProperties}>
          <StoryWide post={first} priority />
        </div>
      )}

      {(page === 1 ? rest : posts).length > 0 && (
        <ul className={cn('grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3', page === 1 ? 'mt-16 border-t border-rule pt-12' : '')}>
          {(page === 1 ? rest : posts).map((post, i) => (
            <Reveal as="li" key={post._id} index={i % 3}>
              <StoryCard post={post} showExcerpt sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-20 flex items-center justify-between border-t border-rule-strong pt-5">
          {page > 1 ? (
            <Link href={href(page - 1)} className="btn btn-ghost" rel="prev">
              <ArrowLeft size={16} /> Newer
            </Link>
          ) : (
            <span />
          )}
          <ol className="flex gap-1">
            {Array.from({length: pages}, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <Link
                  href={href(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={cn(
                    'meta grid h-10 w-10 place-items-center tabular',
                    n === page ? 'bg-ink !text-paper' : 'hover:text-ink',
                  )}
                >
                  {pad(n)}
                </Link>
              </li>
            ))}
          </ol>
          {page < pages ? (
            <Link href={href(page + 1)} className="btn btn-ghost" rel="next">
              Older <ArrowRight size={16} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
