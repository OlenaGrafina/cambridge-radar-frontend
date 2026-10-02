import {cache} from 'react'

import {sanityFetch} from './sanity/client'
import {homeQuery, latestQuery, settingsQuery} from './sanity/queries'
import type {AuthorRef, PostCard, Section, Settings} from './sanity/types'

/** Pseudo-section for the archive of every article (/all — the old /category/all/). */
export const ALL_SECTION: Section = {_id: 'all', title: 'All', slug: 'all'}

const FALLBACK_SETTINGS: Settings = {
  title: 'Cambridge Radar',
  tagline: 'Signals of What’s Next',
  description: '',
  mainMenu: [],
  topMenu: [
    {label: 'Authors', href: '/authors'},
    {label: 'About', href: '/about'},
    {label: 'Contacts', href: '/contacts'},
  ],
  newsletterTitle: 'Discover more from Cambridge Radar - Signals of What’s Next',
  newsletterText: 'Subscribe to get the latest posts sent to your email.',
}

/** Site settings, deduplicated per request and cached across requests. */
export const getSettings = cache(async (): Promise<Settings> => {
  const settings = await sanityFetch<Settings | null>(settingsQuery).catch(() => null)
  if (!settings) return FALLBACK_SETTINGS
  return {
    ...FALLBACK_SETTINGS,
    ...Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== null && v !== undefined)),
  } as Settings
})

export type HomeData = {
  home: {
    lead?: PostCard[] | null
    picks?: PostCard[] | null
    sections?: (Section & {posts: PostCard[]})[] | null
  } | null
  latest: PostCard[]
  authors: AuthorRef[]
}

export const getHome = cache(() => sanityFetch<HomeData>(homeQuery))

export const getLatest = cache((limit = 6) => sanityFetch<PostCard[]>(latestQuery, {limit}))

/** Drop references to unpublished/deleted docs that GROQ returns as null. */
export const compact = <T,>(list: (T | null | undefined)[] | null | undefined): T[] =>
  (list ?? []).filter((x): x is T => Boolean(x))
