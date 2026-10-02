import {writeClient} from '@/lib/sanity/client'

async function unsubscribe(t: string) {
  if (!writeClient || !/^[a-f0-9]{32}$/.test(t)) return false
  const sub = await writeClient.fetch<{_id: string} | null>(`*[_type == "subscriber" && token == $t][0]{_id}`, {t})
  if (!sub) return false
  await writeClient.patch(sub._id).set({status: 'unsubscribed'}).commit()
  return true
}

/** Link in every newsletter email. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get('token') ?? ''
  const ok = await unsubscribe(t)
  const target = new URL('/subscription', req.url)
  target.searchParams.set('status', ok ? 'unsubscribed' : 'invalid')
  return Response.redirect(target, 303)
}

/** RFC 8058 one-click unsubscribe (List-Unsubscribe-Post) from mail clients. */
export async function POST(req: Request) {
  const t = new URL(req.url).searchParams.get('token') ?? ''
  const ok = await unsubscribe(t)
  return new Response(null, {status: ok ? 200 : 400})
}
