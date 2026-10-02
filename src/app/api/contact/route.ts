import {getSettings} from '@/lib/data'
import {writeClient} from '@/lib/sanity/client'
import {emailEnabled, escapeHtml, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'

export async function POST(req: Request) {
  if (!writeClient) return json({error: 'The form is temporarily unavailable. Please email us instead.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'contact', 4)
  if (blocked) return blocked

  const name = str(body.name, 100)
  const email = str(body.email, 200).toLowerCase()
  const subject = str(body.subject, 200)
  const message = str(body.message, 5000)

  if (!name || !message) return json({error: 'Please fill in your name and message.'}, 400)
  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)

  await writeClient.create({
    _type: 'contactMessage',
    handled: false,
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  })

  if (emailEnabled()) {
    const settings = await getSettings()
    if (settings.contactEmail) {
      await sendEmail({
        to: settings.contactEmail,
        replyTo: email,
        subject: `Contact form: ${subject || 'new message'} — ${name}`,
        html: layout({
          title: subject || 'New message from the website',
          body: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
          footer: 'Reply to this email to answer directly.',
        }),
      }).catch((e) => console.error('[contact] email failed', e))
    }
  }

  return json({message: 'Thank you — your message is with the editors. We reply within two working days.'})
}
