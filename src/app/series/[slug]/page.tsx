import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {StoryRow} from '@/components/story/Story'
import {sanityFetch} from '@/lib/sanity/client'
import {seriesQuery, seriesSlugsQuery} from '@/lib/sanity/queries'
import type {Series} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {pad} from '@/lib/utils'

type Params = {params: Promise<{slug: string}>}

const getSeries = (slug: string) => sanityFetch<Series | null>(seriesQuery, {slug})

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(seriesSlugsQuery).catch(() => [])
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {slug} = await params
  const s = await getSeries(slug)
  if (!s) return {}
  return buildMetadata({title: s.title, description: s.description, path: `/series/${s.slug}`, seo: s.seo, image: s.image})
}

export default async function SeriesPage({params}: Params) {
  const {slug} = await params
  const series = await getSeries(slug)
  if (!series) notFound()

  return (
    <div className="shell">
      <header className="rise grid gap-8 pt-10 pb-12 md:grid-cols-12 md:pt-16">
        <div className="md:col-span-7">
          <p className="meta">Series · {pad(series.posts.length)} parts</p>
          <h1 className="display mt-5 text-[3rem] md:text-[5rem]">{series.title}</h1>
          {series.description && <p className="mt-6 max-w-2xl font-serif text-[1.25rem] leading-relaxed text-ink-2">{series.description}</p>}
        </div>
        {series.image?.asset && (
          <div className="md:col-span-5">
            <SanityImg image={series.image} ratio={4 / 3} priority sizes="(min-width: 768px) 40vw, 100vw" />
          </div>
        )}
      </header>
      <ol className="divide-y divide-rule border-t-2 border-rule-strong">
        {series.posts.map((post, i) => (
          <Reveal as="li" key={post._id} index={i % 3} className="grid grid-cols-[3rem_1fr] gap-2 py-6">
            <span className="display text-[2rem] text-muted">{pad(i + 1)}</span>
            <StoryRow post={post} showExcerpt />
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
