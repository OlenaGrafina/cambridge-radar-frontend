import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound, permanentRedirect} from 'next/navigation'

import {AuthorCard} from '@/components/article/AuthorCard'
import {Body, headingIds, withoutRepeatedDek} from '@/components/article/Body'
import {Comments} from '@/components/article/Comments'
import {ReadingProgress} from '@/components/article/ReadingProgress'
import {Share} from '@/components/article/Share'
import {Toc, TocDisclosure} from '@/components/article/Toc'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {JsonLd} from '@/components/seo/JsonLd'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryCard} from '@/components/story/Story'
import {compact, getLatest, getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {imageUrl} from '@/lib/sanity/image'
import {postPathsQuery, postQuery} from '@/lib/sanity/queries'
import type {Post} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {absolute, cn, formatDate, initials, pad, postPath, readingTime, SITE_URL} from '@/lib/utils'

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

  const [settings, latest] = await Promise.all([getSettings(), getLatest(6)])
  const body = withoutRepeatedDek(post.body, post.excerpt)
  const {toc} = headingIds(body)
  const url = absolute(postPath(post))
  const minutes = readingTime(post.chars)

  const related = compact(post.related)
  const fill = compact(latest).filter((p) => p._id !== post._id && !related.some((r) => r._id === p._id))
  const keepReading = [...related, ...fill].slice(0, 3)

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
      <JsonLd data={jsonLd} />

      <article>
        {/* Head */}
        <header className="shell pt-8 md:pt-14">
          <div className="mx-auto max-w-[56rem]">
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

            <h1
              className="rise display mt-6 text-[2.5rem] leading-[1.02] md:text-[4rem] lg:text-[4.75rem]"
              style={{'--i': 1} as React.CSSProperties}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="rise mt-6 max-w-[44rem] font-serif text-[1.25rem] leading-snug text-ink-2 md:text-[1.5rem]"
                style={{'--i': 2} as React.CSSProperties}
              >
                {post.excerpt}
              </p>
            )}

            <div
              className="rise mt-8 flex flex-col gap-5 border-t border-rule pt-5 md:flex-row md:items-center md:justify-between"
              style={{'--i': 3} as React.CSSProperties}
            >
              <div className="flex items-center gap-3.5">
                <Link href={`/authors/${post.author.slug}`} className="block h-11 w-11 shrink-0 overflow-hidden rounded-full" aria-hidden="true" tabIndex={-1}>
                  {post.author.photo?.asset ? (
                    <SanityImg image={post.author.photo} ratio={1} sizes="44px" alt="" />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-paper-2 text-[13px]">{initials(post.author.name)}</span>
                  )}
                </Link>
                <div>
                  <p className="text-[15px]">
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
              <Share url={url} title={post.title} />
            </div>
          </div>
        </header>

        {/* Lead image */}
        {post.mainImage?.asset && (
          <figure className="shell rise mt-10 md:mt-14" style={{'--i': 4} as React.CSSProperties}>
            <div className="mx-auto max-w-[72rem]">
              <SanityImg image={post.mainImage} ratio={16 / 9} priority sizes="(min-width: 1200px) 1152px, 100vw" />
              {(post.mainImage.caption || post.mainImage.credit) && (
                <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[13px] text-muted">
                  {post.mainImage.caption && <span>{post.mainImage.caption}</span>}
                  {post.mainImage.credit && <span className="meta">{post.mainImage.credit}</span>}
                </figcaption>
              )}
            </div>
          </figure>
        )}

        {/* Body with sticky contents */}
        <div className="shell mt-12 md:mt-16">
          <div className="mx-auto grid max-w-[72rem] gap-10 xl:grid-cols-[14rem_minmax(0,40rem)_1fr] xl:gap-14">
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <Toc items={toc} />
              </div>
            </aside>

            <div className="mx-auto w-full max-w-[40rem] xl:mx-0">
              <div className="mb-10">
                <TocDisclosure items={toc} />
              </div>

              <Body value={body} skipAssetId={post.mainImage?.asset?._id} />

              {post.tags && post.tags.length > 0 && (
                <ul className="mt-14 flex flex-wrap gap-2" aria-label="Topics">
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

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
                <p className="kicker">Share this analysis</p>
                <Share url={url} title={post.title} />
              </div>

              {post.series && compact(post.series.posts).length > 1 && (
                <nav aria-label="Series" className="mt-12 bg-paper-2 p-6 md:p-8">
                  <p className="kicker">Series</p>
                  <p className="display mt-2 text-[1.75rem]">
                    <Link href={`/series/${post.series.slug}`} className="hover-line">
                      {post.series.title}
                    </Link>
                  </p>
                  <ol className="mt-5 space-y-2">
                    {compact(post.series.posts).map((p, i) => (
                      <li key={p._id} className="grid grid-cols-[2rem_1fr] gap-1">
                        <span className="meta pt-1">{pad(i + 1)}</span>
                        {p._id === post._id ? (
                          <span className="font-serif text-[1.0625rem] font-medium">{p.title}</span>
                        ) : (
                          <Link href={`/${p.section}/${p.slug}`} className="hover-line w-fit font-serif text-[1.0625rem] text-ink-2">
                            {p.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="mt-14">
                <AuthorCard author={post.author} />
              </div>

              <aside aria-label="Newsletter" className="mt-14 border border-rule-strong p-6 md:p-8">
                <p className="kicker text-signal">Newsletter</p>
                <p className="display mt-3 text-[1.875rem] md:text-[2.25rem]">{settings.newsletterTitle}</p>
                {settings.newsletterText && (
                  <p className="mt-2 font-serif text-[1.0625rem] text-ink-2">{settings.newsletterText}</p>
                )}
                <div className="mt-6">
                  <NewsletterForm source={`article:${post.slug}`} />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </article>

      {keepReading.length > 0 && (
        <section aria-label="Keep reading" className="shell mt-24">
          <SectionHeading title="Keep reading" className="mb-8" />
          <ul className={cn('grid gap-x-8 gap-y-12 sm:grid-cols-2', keepReading.length > 2 && 'lg:grid-cols-3')}>
            {keepReading.map((p, i) => (
              <Reveal as="li" key={p._id} index={i}>
                <StoryCard post={p} showExcerpt sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <div className="shell mt-24">
        <div className="mx-auto max-w-[40rem]">
          <Comments comments={compact(post.comments)} postId={post._id} open={post.allowComments !== false} />
        </div>
      </div>
    </>
  )
}
