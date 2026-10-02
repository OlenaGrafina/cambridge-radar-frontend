import Link from 'next/link'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {JsonLd} from '@/components/seo/JsonLd'
import {Reveal} from '@/components/motion/Reveal'
import {StoryCard, StoryWide} from '@/components/story/Story'
import type {PostCard, Section} from '@/lib/sanity/types'
import {absolute, cn, pad, postPath} from '@/lib/utils'

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

  const url = absolute(page > 1 ? `${base}/page/${page}` : base)
  return (
    <div className="shell">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: section.title,
            url,
            description: section.description,
            isPartOf: {'@id': `${absolute('/')}#website`},
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: posts.map((p, i) => ({'@type': 'ListItem', position: i + 1, url: absolute(postPath(p)), name: p.title})),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {'@type': 'ListItem', position: 1, name: 'Cambridge Radar', item: absolute('/')},
              {'@type': 'ListItem', position: 2, name: section.title, item: absolute(base)},
            ],
          },
        ]}
      />
      <PageHeader
        crumbs={[{label: 'Cambridge Radar', href: '/'}, {label: 'Section'}]}
        title={section.title}
        lede={section.description}
        aside={
          <>
            {pad(total)} {total === 1 ? 'article' : 'articles'}
            {pages > 1 && ` · page ${page} of ${pages}`}
          </>
        }
      />

      {!first && <p className="t-lead py-section text-muted">No articles in this section yet.</p>}

      {first && page === 1 && (
        <div className="rise" style={{'--i': 1} as React.CSSProperties}>
          <StoryWide post={first} priority />
        </div>
      )}

      {(page === 1 ? rest : posts).length > 0 && (
        <ul className={cn('grid gap-x-col gap-y-14 sm:grid-cols-2 lg:grid-cols-3', page === 1 ? 'mt-block border-t border-rule pt-block' : '')}>
          {(page === 1 ? rest : posts).map((post, i) => (
            <Reveal as="li" key={post._id} index={i % 3}>
              <StoryCard post={post} showExcerpt sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-section flex items-center justify-between border-t border-rule-strong pt-5">
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
