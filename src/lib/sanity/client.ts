import {createClient, type QueryParams} from '@sanity/client'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2025-02-19'

/** Every Sanity read is tagged with this; the publish webhook revalidates it. */
export const CONTENT_TAG = 'sanity'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
})

/**
 * Cached read. Pages are static and only rebuild when Sanity publishes
 * (webhook → revalidateTag). The hourly revalidate is a safety net for
 * scheduled posts and a missed webhook.
 */
export function sanityFetch<T>(query: string, params: QueryParams = {}, revalidate = 3600) {
  return client.fetch<T>(query, params, {
    cache: 'force-cache',
    next: {tags: [CONTENT_TAG], revalidate},
  })
}

/** Uncached read for search and API routes. */
export function sanityFetchFresh<T>(query: string, params: QueryParams = {}) {
  return client.fetch<T>(query, params, {cache: 'no-store'})
}

/** Write client, server-only. Null when the token is not configured. */
export const writeClient = process.env.SANITY_WRITE_TOKEN
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })
  : null
