import {PageHeader} from '@/components/layout/PageHeader'
import {Pagination} from '@/components/layout/Pagination'
import {JsonLd} from '@/components/seo/JsonLd'
import {Reveal} from '@/components/motion/Reveal'
import {FeedSlider} from '@/components/home/FeedSlider'
import {LatestArticles} from '@/components/sidebar/LatestArticles'
import {StoryCard, StoryFeature} from '@/components/story/Story'
import {getDailyFeed} from '@/lib/data'
import type {PostCard, Section} from '@/lib/sanity/types'
import {absolute, cn, postPath} from '@/lib/utils'

export const PAGE_SIZE = 9

export async function SectionView({
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
  const feed = await getDailyFeed()
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
        crumbs={[{label: 'Home', href: '/'}, {label: section.crumb ?? section.title}]}
        title={section.title}
        lede={section.description}
        aside={
          <>
            {total} {total === 1 ? 'article' : 'articles'}
            {pages > 1 && ` · page ${page} of ${pages}`}
          </>
        }
      />

      {/* Section posts (left) · Latest Articles and Daily Feed (right), as on the original section pages. */}
      <div className="grid-12 gap-y-section">
        <div className="col-span-12 lg:col-span-8">
          {!first && <p className="t-lead py-section text-muted">No posts found</p>}

          {first && page === 1 && (
            <div className="rise" style={{'--i': 1} as React.CSSProperties}>
              <StoryFeature post={first} priority sizes="(min-width: 1024px) 62vw, 100vw" />
            </div>
          )}

          {(page === 1 ? rest : posts).length > 0 && (
            <ul className={cn('grid gap-x-col gap-y-14 sm:grid-cols-2', page === 1 ? 'mt-block border-t border-rule pt-block' : '')}>
              {(page === 1 ? rest : posts).map((post, i) => (
                <Reveal as="li" key={post._id} index={i % 2}>
                  <StoryCard post={post} showExcerpt sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                </Reveal>
              ))}
            </ul>
          )}

          <Pagination page={page} pages={pages} href={href} />
        </div>
        <aside aria-label="Latest Articles and Daily Feed" className="col-span-12 space-y-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-rule">
          <LatestArticles />
          <FeedSlider title="Daily Feed" posts={feed} perPage={4} autoplayMs={5000} viewAllLabel="View More posts" />
        </aside>
      </div>
    </div>
  )
}
