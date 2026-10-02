import {writeClient} from '@/lib/sanity/client'
import {emailEnabled, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'
import {absolute} from '@/lib/utils'

const token = () => crypto.randomUUID().replace(/-/g, '')

/**
 * Double opt-in sign-up. With email configured the reader confirms from
 * their inbox; without it the address is stored as active (single opt-in)
 * so nothing is lost before Resend is connected.
 */
export async function POST(req: Request) {
  if (!writeClient) return json({error: 'Sign-up is temporarily unavailable.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'subscribe', 5)
  if (blocked) return blocked

  const email = str(body.email, 200).toLowerCase()
  const source = str(body.source, 120) || 'site'
  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)

  const existing = await writeClient.fetch<{_id: string; status: string; token?: string} | null>(
    `*[_type == "subscriber" && email == $email][0]{_id, status, token}`,
    {email},
  )
  if (existing?.status === 'active') return json({message: 'You are already subscribed. Thank you for reading.'})

  const doubleOptIn = emailEnabled()
  const t = existing?.token || token()
  const now = new Date().toISOString()
  const fields = {
    email,
    status: doubleOptIn ? 'pending' : 'active',
    source,
    token: t,
    ...(doubleOptIn ? {} : {confirmedAt: now}),
  }

  if (existing) await writeClient.patch(existing._id).set(fields).commit()
  else await writeClient.create({_type: 'subscriber', createdAt: now, ...fields})

  if (!doubleOptIn) return json({message: 'You are subscribed. New analysis will arrive in your inbox.'})

  const confirm = absolute(`/api/subscribe/confirm?token=${t}`)
  await sendEmail({
    to: email,
    subject: 'Confirm your Cambridge Radar subscription',
    html: layout({
      title: 'One click to confirm',
      body: `<p>Please confirm that you want to receive new analysis from Cambridge Radar.</p>
<p style="margin:28px 0"><a href="${confirm}" style="background:#0b0b0c;color:#ffffff;padding:14px 22px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Confirm subscription</a></p>
<p style="font-size:14px;color:#6b6b70">If you did not sign up, ignore this email — you will not hear from us.</p>`,
    }),
  }).catch((e) => console.error('[subscribe] confirm email failed', e))

  return json({message: 'Almost there — check your inbox to confirm your subscription.'})
}
