import type {Metadata} from 'next'

import {FeedSlider} from '@/components/home/FeedSlider'
import {LeadSlider} from '@/components/home/LeadSlider'
import {NewsletterBand} from '@/components/home/NewsletterBand'
import {VoicesStrip} from '@/components/home/VoicesStrip'
import {Reveal} from '@/components/motion/Reveal'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryCard, StoryFeature, StoryIndex, StoryRow} from '@/components/story/Story'
import {compact, getHome, getSettings} from '@/lib/data'
import {buildMetadata} from '@/lib/seo'
import {Share} from '@/components/article/Share'
import type {PostCard, Section} from '@/lib/sanity/types'
import {cn, SITE_URL} from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const [s, data] = await Promise.all([getSettings(), getHome()])
  const seo = (data.home as {seo?: {title?: string; description?: string}} | null)?.seo
  return buildMetadata({
    title: seo?.title || `${s.title} — ${s.tagline ?? ''}`,
    description: seo?.description || s.description,
    path: '/',
  })
}

export default async function HomePage() {
  const [settings, data] = await Promise.all([getSettings(), getHome()])
  const latest = compact(data.latest)

  const lead = compact(data.home?.lead).length ? compact(data.home?.lead) : latest.slice(0, 3)
  const leadIds = new Set(lead.map((p) => p._id))
  const rest = latest.filter((p) => !leadIds.has(p._id))

  // Left: the latest headlines. Right: the "Daily Feed" slider, as on the
  // original site — it pages through the newest articles (or the editor's
  // picks when set) and ends with "View all".
  const index = latest.slice(0, 10)
  const picks = compact(data.home?.picks)
  const sideTitle = 'Daily Feed'
  const side = picks.length ? picks : latest.slice(0, 12)

  // Section rows: a story appears in one row only — its own section first.
  const used = new Set<string>()
  const sections = compact(data.home?.sections)
    .map((s) => {
      const own = compact(s.posts).sort((a, b) => Number(b.section?.slug === s.slug) - Number(a.section?.slug === s.slug))
      const posts = own.filter((p) => !used.has(p._id)).slice(0, 4)
      posts.forEach((p) => used.add(p._id))
      return {...s, posts}
    })
    .filter((s) => s.posts.length > 0)
  const bigSections = sections.filter((s) => s.posts.length >= 2)
  const smallSections = sections.filter((s) => s.posts.length === 1)

  // "Featured Stories" on the original: the six newest articles in three columns.
  const featured = latest.slice(0, 6)

  if (!latest.length) {
    return (
      <div className="shell py-section text-center">
        <p className="t-h2">No posts found</p>
      </div>
    )
  }

  return (
    <>
      {/* First fold: Latest Articles · Lead · Daily Feed — a broadsheet with column rules. */}
      <section aria-label="Top stories" className="shell pt-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
          <div className="rise lg:col-span-6 lg:col-start-4 lg:px-rule" style={{'--i': 0} as React.CSSProperties}>
            <LeadSlider posts={lead} />
          </div>

          <aside
            aria-labelledby="latest-title"
            className="rise lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:border-r lg:border-rule lg:pr-rule"
            style={{'--i': 1} as React.CSSProperties}
          >
            <h2 id="latest-title" className="kicker flex items-center justify-between border-t-2 border-rule-strong pt-3">
              Latest Articles
            </h2>
            <ol className="mt-5 divide-y divide-rule">
              {index.map((post, i) => (
                <li key={post._id} className="py-4 first:pt-0">
                  <StoryIndex post={post} index={i + 1} />
                </li>
              ))}
            </ol>
          </aside>

          <aside
            aria-label="Daily Feed"
            className="rise lg:col-span-3 lg:border-l lg:border-rule lg:pl-rule"
            style={{'--i': 2} as React.CSSProperties}
          >
            <FeedSlider title={sideTitle} posts={side} perPage={4} autoplayMs={5000} viewAllLabel="View More posts" />
          </aside>
        </div>
      </section>

      {/* Section rows */}
      <div className="shell mt-section space-y-section">
        {bigSections.map((section, i) => (
          <SectionRow key={section._id} section={section} index={i} />
        ))}

        {smallSections.length > 0 && (
          <div className={cn('grid gap-x-col gap-y-12', smallSections.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {smallSections.map((section, i) => (
              <Reveal key={section._id} index={i} as="section">
                <SectionHeading title={section.title} href={`/${section.slug}`} as="h2" className="mb-6" />
                <StoryCard post={section.posts[0]} showExcerpt sizes="(min-width: 768px) 33vw, 100vw" />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <div className="mt-section">
        <NewsletterBand settings={settings} source="home" />
      </div>

      {compact(data.authors).length > 0 && (
        <section aria-labelledby="voices" className="shell cv-auto mt-section">
          <SectionHeading title="Authors" href="/authors" className="mb-2" />
          <VoicesStrip authors={compact(data.authors)} />
        </section>
      )}

      {featured.length > 0 && (
        <section aria-label="Featured Stories" className="shell cv-auto mt-section">
          <SectionHeading title="Featured Stories" className="mb-8" />
          <ul className="grid gap-x-col gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((post, i) => (
              <Reveal as="li" key={post._id} index={i % 3}>
                <StoryCard post={post} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <div className="shell mt-section">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
          <p className="kicker">Share this:</p>
          <Share url={SITE_URL} title={settings.title} />
        </div>
      </div>
    </>
  )
}

function SectionRow({section, index}: {section: Section & {posts: PostCard[]}; index: number}) {
  const [first, ...others] = section.posts
  const flip = index % 2 === 1
  const heading = (
    <div id={`row-${section.slug}`}>
      <SectionHeading title={section.title} href={`/${section.slug}`} className="mb-8" />
    </div>
  )

  // Two stories: an even split reads better than a feature with one lonely row.
  if (section.posts.length === 2) {
    return (
      <section aria-labelledby={`row-${section.slug}`} className="cv-auto">
        {heading}
        <div className="grid gap-12 md:grid-cols-2 md:gap-0">
          {section.posts.map((post, i) => (
            <Reveal key={post._id} index={i} className={i === 0 ? 'md:border-r md:border-rule md:pr-rule' : 'md:pl-rule'}>
              <StoryFeature post={post} sizes="(min-width: 768px) 50vw, 100vw" />
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={`row-${section.slug}`} className="cv-auto">
      {heading}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
        <Reveal className={cn('lg:col-span-7', flip ? 'lg:order-2 lg:pl-rule' : 'lg:pr-rule')}>
          <StoryFeature post={first} sizes="(min-width: 1024px) 56vw, 100vw" />
        </Reveal>
        <ul
          className={cn(
            'divide-y divide-rule lg:col-span-5',
            flip ? 'lg:order-1 lg:border-r lg:border-rule lg:pr-rule' : 'lg:border-l lg:border-rule lg:pl-rule',
          )}
        >
          {others.map((post, i) => (
            <Reveal as="li" key={post._id} index={i + 1} className="py-5 first:pt-0">
              <StoryRow post={post} showSection={false} />
            </Reveal>
          ))}
          {section.description && (
            <li className="py-5">
              <p className="t-body-sm font-serif text-muted italic">{section.description}</p>
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
