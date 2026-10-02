import {revalidateTag} from 'next/cache'

import {CONTENT_TAG, writeClient} from '@/lib/sanity/client'
import {emailEnabled, escapeHtml, layout, sendBatch} from '@/lib/server/email'
import {json} from '@/lib/server/guard'
import {absolute, postPath} from '@/lib/utils'

/**
 * Sanity publish webhook (sanity.io/manage → API → Webhooks):
 *   URL      https://cambridge-radar.com/api/revalidate
 *   Trigger  create, update, delete · Filter: all documents
 *   Projection {_id, _type}
 *   Secret   = SANITY_REVALIDATE_SECRET
 *
 * 1. Expires every cached Sanity read, so the next visitor gets fresh pages.
 * 2. A newly published article → newsletter to active subscribers (once).
 */

async function validSignature(req: Request, raw: string, secret: string) {
  const header = req.headers.get('sanity-webhook-signature')
  if (!header) return new URL(req.url).searchParams.get('secret') === secret
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const t = parts.t
  const v1 = parts.v1
  if (!t || !v1) return false
  if (Math.abs(Date.now() - Number(t)) > 5 * 60_000) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${raw}`))
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return expected === v1.replace(/=+$/, '')
}

const FRESH_HOURS = 72

async function sendNewsletter(postId: string) {
  if (!writeClient || !emailEnabled()) return 'email disabled'
  const data = await writeClient.fetch<{
    post: {_id: string; title: string; slug: string; excerpt?: string; publishedAt: string; newsletterSentAt?: string; section?: {slug: string}; author?: {name: string}} | null
    autoSend: boolean | null
    subs: {email: string; token: string}[]
  }>(
    `{
      "post": *[_id == $id && _type == "post"][0]{_id, title, "slug": slug.current, excerpt, publishedAt, newsletterSentAt, "section": category->{"slug": slug.current}, "author": author->{name}},
      "autoSend": *[_id == "siteSettings"][0].newsletterAutoSend,
      "subs": *[_type == "subscriber" && status == "active" && defined(token)]{email, token}
    }`,
    {id: postId},
  )
  const post = data.post
  if (!post || post.newsletterSentAt || data.autoSend === false) return 'skip'
  // Only genuinely new articles: editing or re-publishing an old one never emails anyone.
  if (Date.now() - new Date(post.publishedAt).getTime() > FRESH_HOURS * 3600_000) return 'not fresh'
  if (new Date(post.publishedAt).getTime() > Date.now()) return 'scheduled'

  // Claim the send first so a second webhook can't double-send.
  await writeClient.patch(post._id).setIfMissing({newsletterSentAt: new Date().toISOString()}).commit()

  const url = absolute(postPath({slug: post.slug, section: post.section}))
  await sendBatch(
    data.subs.map((s) => {
      const unsub = absolute(`/api/unsubscribe?token=${s.token}`)
      return {
        to: s.email,
        subject: post.title,
        html: layout({
          title: post.title,
          body: `${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ''}${post.author ? `<p style="font-size:14px;color:#6b6b70">By ${escapeHtml(post.author.name)}</p>` : ''}
<p style="margin:28px 0"><a href="${url}" style="background:#0b0b0c;color:#ffffff;padding:14px 22px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Read the analysis</a></p>`,
          footer: `You receive this because you subscribed to Cambridge Radar. <a href="${unsub}" style="color:#6b6b70">Unsubscribe</a>`,
        }),
        headers: {'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'},
      }
    }),
  )
  return `sent to ${data.subs.length}`
}


export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return json({error: 'Revalidation secret is not configured'}, 500)

  const raw = await req.text()
  if (!(await validSignature(req, raw, secret))) return json({error: 'Invalid signature'}, 401)

  const body = (JSON.parse(raw || '{}') ?? {}) as {_id?: string; _type?: string}
  revalidateTag(CONTENT_TAG, {expire: 0})

  const id = (body._id ?? '').replace(/^drafts\./, '')
  let extra: string | undefined
  try {
    if (body._type === 'post' && id && !body._id?.startsWith('drafts.')) extra = await sendNewsletter(id)
  } catch (e) {
    console.error('[revalidate] side effect failed', e)
    extra = 'side effect failed'
  }

  return json({revalidated: true, type: body._type, extra})
}
