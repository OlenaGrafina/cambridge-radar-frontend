import type {Metadata} from 'next'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {sanityFetch} from '@/lib/sanity/client'
import {allPostsQuery} from '@/lib/sanity/queries'
import {ALL_SECTION as ALL} from '@/lib/data'
import type {PostCard} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'


export const metadata: Metadata = buildMetadata({
  title: 'All articles',
  description: 'Every article published on Cambridge Radar, newest first.',
  path: '/all',
})

/** Every article, newest first — the old /category/all/ archive and the target of "View all". */
export default async function AllPage() {
  const {posts, total} = await sanityFetch<{posts: PostCard[]; total: number}>(allPostsQuery, {from: 0, to: PAGE_SIZE})
  return <SectionView section={ALL} posts={posts} page={1} total={total} />
}
