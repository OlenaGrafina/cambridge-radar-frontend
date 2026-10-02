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
  return withRetry(() =>
    client.fetch<T>(query, params, {
      cache: 'force-cache',
      next: {tags: [CONTENT_TAG], revalidate},
    }),
  )
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
