import type {Metadata} from 'next'

import {LeadSlider} from '@/components/home/LeadSlider'
import {NewsletterBand} from '@/components/home/NewsletterBand'
import {VoicesStrip} from '@/components/home/VoicesStrip'
import {Reveal} from '@/components/motion/Reveal'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryCard, StoryFeature, StoryIndex, StoryRow} from '@/components/story/Story'
import {compact, getHome, getSettings} from '@/lib/data'
import type {PostCard, Section} from '@/lib/sanity/types'
import {cn, pad} from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const [s, data] = await Promise.all([getSettings(), getHome()])
  const seo = (data.home as {seo?: {title?: string; description?: string}} | null)?.seo
  return {
    title: {absolute: seo?.title || `${s.title} — ${s.tagline ?? ''}`},
    description: seo?.description || s.description,
    alternates: {canonical: '/'},
  }
}

export default async function HomePage() {
  const [settings, data] = await Promise.all([getSettings(), getHome()])
  const latest = compact(data.latest)

  const lead = compact(data.home?.lead).length ? compact(data.home?.lead) : latest.slice(0, 3)
  const leadIds = new Set(lead.map((p) => p._id))
  const rest = latest.filter((p) => !leadIds.has(p._id))

  // Left index and right feed never repeat each other.
  const index = rest.slice(0, 6)
  const picks = compact(data.home?.picks)
  const sideTitle = picks.length ? 'Editor’s picks' : 'Daily feed'
  const feed = rest.slice(6, 11)
  const side = (picks.length ? picks : feed.length >= 3 ? feed : rest.slice(0, 5)).slice(0, 5)

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

  const shownIds = new Set([...leadIds, ...index.map((p) => p._id), ...side.map((p) => p._id)])
  const archive = latest.filter((p) => !shownIds.has(p._id)).slice(0, 8)

  if (!latest.length) {
    return (
      <div className="shell py-32 text-center">
        <p className="display text-4xl">The first signals are on their way.</p>
      </div>
    )
  }

  return (
    <>
      {/* First fold: Latest · Lead · Daily feed — a broadsheet with column rules. */}
      <section aria-label="Top stories" className="shell pt-8 md:pt-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
          <div className="rise lg:col-span-6 lg:col-start-4 lg:px-8 xl:px-10" style={{'--i': 0} as React.CSSProperties}>
            <LeadSlider posts={lead} />
          </div>

          <aside
            aria-labelledby="latest-title"
            className="rise lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:border-r lg:border-rule lg:pr-8"
            style={{'--i': 1} as React.CSSProperties}
          >
            <h2 id="latest-title" className="kicker flex items-center justify-between border-t-2 border-rule-strong pt-3">
              Latest
              <span className="meta">{pad(index.length)}</span>
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
            aria-labelledby="feed-title"
            className="rise lg:col-span-3 lg:border-l lg:border-rule lg:pl-8"
            style={{'--i': 2} as React.CSSProperties}
          >
            <h2 id="feed-title" className="display border-t-2 border-rule-strong pt-3 text-[1.75rem]">
              {sideTitle}
            </h2>
            <ul className="mt-5 divide-y divide-rule">
              {side.map((post) => (
                <li key={post._id} className="py-4 first:pt-0">
                  <StoryRow post={post} compact />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Section rows */}
      <div className="shell mt-20 space-y-20 md:mt-28 md:space-y-24">
        {bigSections.map((section, i) => (
          <SectionRow key={section._id} section={section} index={i} />
        ))}

        {smallSections.length > 0 && (
          <div className={cn('grid gap-12 md:gap-8', smallSections.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {smallSections.map((section, i) => (
              <Reveal key={section._id} index={i} as="section">
                <SectionHeading title={section.title} href={`/${section.slug}`} as="h2" className="mb-6" />
                <StoryCard post={section.posts[0]} showExcerpt sizes="(min-width: 768px) 33vw, 100vw" />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <div className="mt-24 md:mt-32">
        <NewsletterBand settings={settings} source="home" />
      </div>

      {compact(data.authors).length > 0 && (
        <section aria-labelledby="voices" className="shell mt-20 md:mt-28">
          <SectionHeading title="Voices" href="/authors" className="mb-2" />
          <p className="mb-2 max-w-xl font-serif text-[1.0625rem] text-ink-2" id="voices">
            Strategists, researchers and practitioners writing for Cambridge Radar.
          </p>
          <VoicesStrip authors={compact(data.authors)} />
        </section>
      )}

      {archive.length > 0 && (
        <section aria-label="More from the Radar" className="shell mt-20 md:mt-28">
          <SectionHeading title="More from the Radar" className="mb-8" />
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {archive.map((post, i) => (
              <Reveal as="li" key={post._id} index={i % 4}>
                <StoryCard post={post} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function SectionRow({section, index}: {section: Section & {posts: PostCard[]}; index: number}) {
  const [first, ...others] = section.posts
  const flip = index % 2 === 1
  const heading = (
    <div id={`row-${section.slug}`}>
      <SectionHeading title={section.title} href={`/${section.slug}`} index={pad(index + 1)} className="mb-8" />
    </div>
  )

  // Two stories: an even split reads better than a feature with one lonely row.
  if (section.posts.length === 2) {
    return (
      <section aria-labelledby={`row-${section.slug}`}>
        {heading}
        <div className="grid gap-12 md:grid-cols-2 md:gap-0">
          {section.posts.map((post, i) => (
            <Reveal key={post._id} index={i} className={i === 0 ? 'md:border-r md:border-rule md:pr-10' : 'md:pl-10'}>
              <StoryFeature post={post} sizes="(min-width: 768px) 50vw, 100vw" />
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={`row-${section.slug}`}>
      {heading}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
        <Reveal className={cn('lg:col-span-7', flip ? 'lg:order-2 lg:pl-10' : 'lg:pr-10')}>
          <StoryFeature post={first} sizes="(min-width: 1024px) 56vw, 100vw" />
        </Reveal>
        <ul
          className={cn(
            'divide-y divide-rule lg:col-span-5',
            flip ? 'lg:order-1 lg:border-r lg:border-rule lg:pr-10' : 'lg:border-l lg:border-rule lg:pl-10',
          )}
        >
          {others.map((post, i) => (
            <Reveal as="li" key={post._id} index={i + 1} className="py-5 first:pt-0">
              <StoryRow post={post} showSection={false} />
            </Reveal>
          ))}
          {section.description && (
            <li className="py-5">
              <p className="font-serif text-[1rem] leading-relaxed text-muted italic">{section.description}</p>
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
