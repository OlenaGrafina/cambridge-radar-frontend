import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {sanityFetch} from '@/lib/sanity/client'
import {sectionPostsQuery, sectionQuery, sectionSlugsQuery} from '@/lib/sanity/queries'
import type {PostCard, Section} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'

type Params = {params: Promise<{slug: string; n: string}>}

export async function generateStaticParams() {
  const sections = await sanityFetch<{slug: string; total: number}[]>(sectionSlugsQuery).catch(() => [])
  return sections.flatMap((s) =>
    Array.from({length: Math.max(0, Math.ceil(s.total / PAGE_SIZE) - 1)}, (_, i) => ({slug: s.slug, n: String(i + 2)})),
  )
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {slug, n} = await params
  const section = await sanityFetch<Section | null>(sectionQuery, {slug})
  if (!section) return {}
  return buildMetadata({
    title: `${section.title} — page ${n}`,
    description: section.description,
    path: `/${slug}/page/${n}`,
    seo: section.seo,
  })
}

export default async function SectionPage({params}: Params) {
  const {slug, n} = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 1) notFound()
  if (page === 1) permanentRedirect(`/${slug}`)

  const section = await sanityFetch<Section | null>(sectionQuery, {slug})
  if (!section) notFound()

  const from = (page - 1) * PAGE_SIZE
  const {posts, total} = await sanityFetch<{posts: PostCard[]; total: number}>(sectionPostsQuery, {
    sectionId: section._id,
    from,
    to: from + PAGE_SIZE,
  })
  if (!posts.length) notFound()

  return <SectionView section={section} posts={posts} page={page} total={total} />
}
