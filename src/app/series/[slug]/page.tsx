import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {PageHeader} from '@/components/layout/PageHeader'
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
      <PageHeader kicker={`Series · ${series.posts.length} parts`} title={series.title} lede={series.description}>
        {series.image?.asset && (
          <SanityImg image={series.image} ratio={2 / 1} priority sizes="(min-width: 1320px) 1256px, 100vw" className="mt-block" />
        )}
      </PageHeader>
      <ol className="divide-y divide-rule border-t-2 border-rule-strong">
        {series.posts.map((post, i) => (
          <Reveal as="li" key={post._id} index={i % 3} className="grid grid-cols-[4.5rem_1fr] gap-2 py-6">
            <span className="meta pt-1">Part {i + 1}</span>
            <StoryRow post={post} showExcerpt />
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
