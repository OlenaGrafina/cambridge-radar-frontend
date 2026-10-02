/**
 * Spam protection shared by the public forms: honeypot, a per-IP rate limit
 * and Cloudflare Turnstile when its secret is configured.
 *
 * The rate limit lives in memory, so on Cloudflare it is per isolate — a
 * speed bump for scripts, not a guarantee. Turnstile is the real gate.
 */

const hits = new Map<string, number[]>()

export function clientIp(req: Request) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export function rateLimited(key: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > limit
}

export async function verifyTurnstile(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token) return false
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip !== 'unknown') body.append('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method: 'POST', body})
    const data = (await res.json()) as {success?: boolean}
    return Boolean(data.success)
  } catch {
    return false
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function json(data: unknown, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control': 'no-store'}})
}

/** Runs the common checks; returns an error Response or null when the request may proceed. */
export async function guard(req: Request, body: Record<string, unknown>, bucket: string, limit?: number) {
  if (str(body.website, 200)) return json({message: 'Thank you.'}) // honeypot: pretend success
  const ip = clientIp(req)
  if (rateLimited(`${bucket}:${ip}`, limit)) {
    return json({error: 'Too many attempts. Please try again in a few minutes.'}, 429)
  }
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return json({error: 'We could not verify you are human. Please reload the page and try again.'}, 400)
  }
  return null
}
