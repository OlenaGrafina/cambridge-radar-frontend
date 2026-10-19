import {createClient, type QueryParams} from '@sanity/client'
import {unstable_cache} from 'next/cache'

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
 * (webhook → revalidateTag). The daily revalidate is a safety net for
 * scheduled posts and a missed webhook.
 *
 * Vercel bills an ISR write only when the cached value changes. The fetch
 * cache stored Sanity's raw response, whose "ms" timing differs every time, so
 * each hourly revalidation was a write even with no new content: 217K in a
 * month on a 200K free plan. unstable_cache stores the result alone, which
 * stays byte-identical until an editor publishes.
 */
const cachedFetch = unstable_cache(
  (query: string, params: QueryParams) => withRetry(() => client.fetch<unknown>(query, params, {cache: 'no-store'})),
  ['sanity-fetch'],
  {tags: [CONTENT_TAG], revalidate: 86400},
)

export function sanityFetch<T>(query: string, params: QueryParams = {}) {
  return cachedFetch(query, params) as Promise<T>
}

/** A dropped TLS handshake must not fail a whole static build: retry with backoff. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const status = (error as {statusCode?: number}).statusCode
      if (status && status < 500 && status !== 429) throw error
      await new Promise((r) => setTimeout(r, 400 * 2 ** i))
    }
  }
  throw lastError
}

/**
 * Uncached read for search. Goes through Sanity's API CDN (1M requests/month
 * on the free plan vs 250k for the live API), which is updated seconds after
 * a publish: every search query is unique, so nothing else would cache it.
 */
const cdnClient = client.withConfig({useCdn: true})
export function sanityFetchFresh<T>(query: string, params: QueryParams = {}) {
  return cdnClient.fetch<T>(query, params, {cache: 'no-store'})
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
