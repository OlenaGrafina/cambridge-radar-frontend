import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound, permanentRedirect} from 'next/navigation'

import {ArticleTracker} from '@/components/analytics/ArticleTracker'
import {AuthorCard} from '@/components/article/AuthorCard'
import {Body, headingIds, withoutRepeatedDek} from '@/components/article/Body'
import {ReadingProgress} from '@/components/article/ReadingProgress'
import {Share} from '@/components/article/Share'
import {Toc, TocDisclosure} from '@/components/article/Toc'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {JsonLd} from '@/components/seo/JsonLd'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryCard, StoryRow} from '@/components/story/Story'
import {compact, getLatest, getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {imageUrl} from '@/lib/sanity/image'
import {postPathsQuery, postQuery} from '@/lib/sanity/queries'
import type {Post} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {absolute, formatDate, initials, pad, postPath, readingTime, SITE_URL} from '@/lib/utils'

type Params = {params: Promise<{slug: string; article: string}>}

const getPost = (slug: string) => sanityFetch<Post | null>(postQuery, {slug})

export async function generateStaticParams() {
  const paths = await sanityFetch<{slug: string; section: string}[]>(postPathsQuery).catch(() => [])
  return paths.filter((p) => p.section).map((p) => ({slug: p.section, article: p.slug}))
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {article} = await params
  const post = await getPost(article)
  if (!post) return {}
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: postPath(post),
    seo: post.seo,
    image: post.mainImage,
    type: 'article',
    extra: {
      authors: post.author ? [{name: post.author.name, url: absolute(`/authors/${post.author.slug}`)}] : undefined,
      other: {
        'article:published_time': post.publishedAt,
        ...(post.updatedAt ? {'article:modified_time': post.updatedAt} : {}),
        'article:section': post.section?.title ?? '',
      },
    },
  })
}

export default async function ArticlePage({params}: Params) {
  const {slug, article} = await params
  const post = await getPost(article)
  if (!post) notFound()
  // One canonical address per article: /<main section>/<slug>.
  if (post.section?.slug && post.section.slug !== slug) permanentRedirect(postPath(post))

  const [settings, latest] = await Promise.all([getSettings(), getLatest(8)])
  const body = withoutRepeatedDek(post.body, post.excerpt)
  const {toc} = headingIds(body)
  const url = absolute(postPath(post))
  const minutes = readingTime(post.chars)

  // Sidebar: more from the same section or author. Bottom: the newest of
  // everything else, so the two lists never repeat each other.
  const related = compact(post.related).slice(0, 4)
  const shown = new Set([post._id, ...related.map((p) => p._id)])
  const keepReading = compact(latest).filter((p) => !shown.has(p._id)).slice(0, 3)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: post.title,
      description: post.excerpt,
      ...(post.mainImage ? {image: [imageUrl(post.mainImage, 1600), imageUrl(post.mainImage, 1200, 1200)].filter(Boolean)} : {}),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      mainEntityOfPage: url,
      articleSection: post.section?.title,
      keywords: post.tags?.join(', '),
      wordCount: post.chars ? Math.round(post.chars / 5.6) : undefined,
      author: post.author && {
        '@type': 'Person',
        name: post.author.name,
        url: absolute(`/authors/${post.author.slug}`),
        jobTitle: post.author.role,
      },
      publisher: {'@id': `${SITE_URL}/#organization`},
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: settings.title, item: SITE_URL},
        {'@type': 'ListItem', position: 2, name: post.section?.title, item: absolute(`/${post.section?.slug}`)},
        {'@type': 'ListItem', position: 3, name: post.title, item: url},
      ],
    },
  ]

  return (
    <>
      <ReadingProgress />
      <ArticleTracker article={post.slug} section={post.section?.slug} author={post.author?.name} />
      <JsonLd data={jsonLd} />

      <article className="shell">
        {/* Head: same left edge as the masthead rule and the body below */}
        <header className="pt-page">
          <nav aria-label="Breadcrumb" className="rise meta flex flex-wrap items-center gap-2">
            <Link href={`/${post.section?.slug}`} className="text-ink hover:text-signal">
              {post.section?.title}
            </Link>
            {compact(post.otherSections).map((s) => (
              <span key={s._id} className="contents">
                <span aria-hidden="true">·</span>
                <Link href={`/${s.slug}`} className="hover:text-ink">
                  {s.title}
                </Link>
              </span>
            ))}
            {post.series && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/series/${post.series.slug}`} className="hover:text-ink">
                  Series: {post.series.title}
                </Link>
              </>
            )}
          </nav>

          <div className="grid-12">
            <h1 className="rise t-h1 col-span-12 mt-6 lg:col-span-10" style={{'--i': 1} as React.CSSProperties}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="rise t-lead col-span-12 mt-6 text-ink-2 lg:col-span-8" style={{'--i': 2} as React.CSSProperties}>
                {post.excerpt}
              </p>
            )}
          </div>

          <div
            className="rise mt-8 flex flex-col gap-5 border-t border-rule pt-5 md:flex-row md:items-center md:justify-between"
            style={{'--i': 3} as React.CSSProperties}
          >
            <div className="flex items-center gap-3.5">
              <Link
                href={`/authors/${post.author.slug}`}
                className="block h-11 w-11 shrink-0 overflow-hidden rounded-full"
                aria-hidden="true"
                tabIndex={-1}
              >
                {post.author.photo?.asset ? (
                  <SanityImg image={post.author.photo} ratio={1} sizes="44px" alt="" />
                ) : (
                  <span className="t-ui-sm grid h-full w-full place-items-center bg-paper-2">{initials(post.author.name)}</span>
                )}
              </Link>
              <div>
                <p className="t-ui">
                  By{' '}
                  <Link href={`/authors/${post.author.slug}`} className="hover-line font-medium">
                    {post.author.name}
                  </Link>
                </p>
                <p className="meta mt-1 flex flex-wrap gap-x-2">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  {minutes && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{minutes} min read</span>
                    </>
                  )}
                  {post.updatedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Updated {formatDate(post.updatedAt)}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <Share url={url} title={post.title} image={imageUrl(post.mainImage, 1000)} />
          </div>
        </header>

        {/* Lead image: full container width */}
        {post.mainImage?.asset && (
          <figure className="rise mt-block" style={{'--i': 4} as React.CSSProperties}>
            <SanityImg image={post.mainImage} ratio={2 / 1} priority sizes="(min-width: 1320px) 1256px, 100vw" />
            {(post.mainImage.caption || post.mainImage.credit) && (
              <figcaption className="t-ui-sm mt-3 grid-12 gap-y-1 text-muted">
                {post.mainImage.caption && <span className="col-span-12 line-clamp-3 lg:col-span-8">{post.mainImage.caption}</span>}
                {post.mainImage.credit && (
                  <span className="meta col-span-12 lg:col-span-4 lg:text-right">{post.mainImage.credit}</span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Body (left) · contents and more from the section (right) */}
        <div className="mt-block grid-12">
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="mb-8 lg:hidden">
              <TocDisclosure items={toc} />
            </div>

            <div data-article-body>
              <Body value={body} skipAssetId={post.mainImage?.asset?._id} />
            </div>

            {post.tags && post.tags.length > 0 && (
              <ul className="mt-block flex flex-wrap gap-2" aria-label="Topics">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="meta inline-block border border-rule px-2.5 py-1.5 transition-colors hover:border-rule-strong hover:text-ink"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
              <p className="kicker">Share this:</p>
              <Share url={url} title={post.title} image={imageUrl(post.mainImage, 1000)} />
            </div>

            {post.series && compact(post.series.posts).length > 1 && (
              <nav aria-label="Series" className="mt-block bg-paper-2 p-6 md:p-8">
                <p className="kicker">Series</p>
                <p className="t-h4 mt-2">
                  <Link href={`/series/${post.series.slug}`} className="hover-line">
                    {post.series.title}
                  </Link>
                </p>
                <ol className="mt-5 space-y-2">
                  {compact(post.series.posts).map((p, i) => (
                    <li key={p._id} className="grid grid-cols-[2rem_1fr] gap-1">
                      <span className="meta pt-1">{pad(i + 1)}</span>
                      {p._id === post._id ? (
                        <span className="t-body-sm font-medium">{p.title}</span>
                      ) : (
                        <Link href={`/${p.section}/${p.slug}`} className="t-body-sm hover-line w-fit text-ink-2">
                          {p.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="mt-block">
              <AuthorCard author={post.author} />
            </div>

            <aside aria-label="Newsletter" className="mt-block border border-rule-strong p-6 md:p-8">
              <p className="kicker text-signal">Newsletter</p>
              <p className="t-h3 mt-3">{settings.newsletterTitle}</p>
              {settings.newsletterText && <p className="t-body-sm mt-2 text-ink-2">{settings.newsletterText}</p>}
              <div className="mt-6">
                <NewsletterForm source={`article:${post.slug}`} />
              </div>
            </aside>

          </div>

          <aside aria-label="Contents and related" className="hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="sticky top-24 space-y-12">
              <Toc items={toc} />
              {related.length > 0 && (
                <section aria-labelledby="related-title">
                  <h2 id="related-title" className="kicker border-t-2 border-rule-strong pt-3">
                    Related
                  </h2>
                  <ul className="mt-5 divide-y divide-rule">
                    {related.map((p) => (
                      <li key={p._id} className="py-4 first:pt-0">
                        <StoryRow post={p} compact />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </article>

      {(keepReading.length > 0 || related.length > 0) && (
        <section aria-label="More posts" className="shell cv-auto mt-section">
          <SectionHeading title="More posts" className="mb-8" />
          <ul className="grid gap-x-col gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {(keepReading.length ? keepReading : related.slice(0, 3)).map((p, i) => (
              <Reveal as="li" key={p._id} index={i}>
                <StoryCard post={p} showExcerpt sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
