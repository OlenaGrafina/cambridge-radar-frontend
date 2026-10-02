import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {PageView} from '@/components/page/PageView'
import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {pageQuery, pageSlugsQuery, sectionPostsQuery, sectionQuery, sectionSlugsQuery} from '@/lib/sanity/queries'
import type {Page, PostCard, Section} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'

type Params = {params: Promise<{slug: string}>}

/** One top-level segment serves both sections (/geopolitics) and pages (/about). */
async function resolve(slug: string) {
  const section = await sanityFetch<Section | null>(sectionQuery, {slug})
  if (section) return {kind: 'section' as const, section}
  const page = await sanityFetch<Page | null>(pageQuery, {slug})
  if (page) return {kind: 'page' as const, page}
  return null
}

export async function generateStaticParams() {
  const [sections, pages] = await Promise.all([
    sanityFetch<{slug: string}[]>(sectionSlugsQuery).catch(() => []),
    sanityFetch<string[]>(pageSlugsQuery).catch(() => []),
  ])
  return [...sections.map((s) => ({slug: s.slug})), ...pages.map((slug) => ({slug}))]
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {slug} = await params
  const found = await resolve(slug)
  if (!found) return {}
  if (found.kind === 'section') {
    const s = found.section
    return buildMetadata({
      title: s.title,
      description: s.description || `${s.title}: analysis and commentary from Cambridge Radar.`,
      path: `/${s.slug}`,
      seo: s.seo,
    })
  }
  const p = found.page
  return buildMetadata({title: p.title, description: p.lede, path: `/${p.slug}`, seo: p.seo, image: p.image})
}

export default async function SlugPage({params}: Params) {
  const {slug} = await params
  const found = await resolve(slug)
  if (!found) notFound()

  if (found.kind === 'page') {
    const settings = await getSettings()
    return <PageView page={found.page} settings={settings} />
  }

  const {posts, total} = await sanityFetch<{posts: PostCard[]; total: number}>(sectionPostsQuery, {
    sectionId: found.section._id,
    from: 0,
    to: PAGE_SIZE,
  })
  return <SectionView section={found.section} posts={posts} page={1} total={total} />
}
