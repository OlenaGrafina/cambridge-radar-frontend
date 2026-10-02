import {writeClient} from '@/lib/sanity/client'

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get('token') ?? ''
  const target = new URL('/subscription', req.url)
  if (!writeClient || !/^[a-f0-9]{32}$/.test(t)) {
    target.searchParams.set('status', 'invalid')
    return Response.redirect(target, 303)
  }
  const sub = await writeClient.fetch<{_id: string} | null>(`*[_type == "subscriber" && token == $t][0]{_id}`, {t})
  if (!sub) {
    target.searchParams.set('status', 'invalid')
    return Response.redirect(target, 303)
  }
  await writeClient.patch(sub._id).set({status: 'active', confirmedAt: new Date().toISOString()}).commit()
  target.searchParams.set('status', 'confirmed')
  return Response.redirect(target, 303)
}
