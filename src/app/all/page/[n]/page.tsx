import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {sanityFetch} from '@/lib/sanity/client'
import {allPostsQuery} from '@/lib/sanity/queries'
import type {PostCard} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'

import {ALL_SECTION as ALL} from '@/lib/data'

type Params = {params: Promise<{n: string}>}

export async function generateStaticParams() {
  const {total} = await sanityFetch<{total: number}>(allPostsQuery, {from: 0, to: 1}).catch(() => ({total: 0}))
  return Array.from({length: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)}, (_, i) => ({n: String(i + 2)}))
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {n} = await params
  return buildMetadata({title: `All articles — page ${n}`, path: `/all/page/${n}`})
}

export default async function AllPaged({params}: Params) {
  const {n} = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 1) notFound()
  if (page === 1) permanentRedirect('/all')
  const from = (page - 1) * PAGE_SIZE
  const {posts, total} = await sanityFetch<{posts: PostCard[]; total: number}>(allPostsQuery, {from, to: from + PAGE_SIZE})
  if (!posts.length) notFound()
  return <SectionView section={ALL} posts={posts} page={page} total={total} />
}
