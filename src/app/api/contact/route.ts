import {getSettings} from '@/lib/data'
import {writeClient} from '@/lib/sanity/client'
import {emailEnabled, escapeHtml, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'

/** What the Contribute form offers; anything else is treated as "not sure yet". */
const FORMATS: Record<string, string> = {
  article: 'Expert Article',
  interview: 'Interview',
  perspectives: 'Perspectives',
  organisation: 'Organisation Feature',
}

/** People type "linkedin.com/in/name"; accept it and store a proper URL. */
function toUrl(raw: string) {
  const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(value)
    return url.hostname.includes('.') ? url.toString() : ''
  } catch {
    return ''
  }
}

/** Contacts and Contribute forms. Both land in the Studio inbox and, if set up, in the editor's mailbox. */
export async function POST(req: Request) {
  if (!writeClient) return json({error: 'The form is temporarily unavailable. Please email us instead.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'contact', 4)
  if (blocked) return blocked

  const form = body.form === 'contribute' ? 'contribute' : 'contact'
  const name = str(body.name, 100)
  const email = str(body.email, 200).toLowerCase()
  const messageText = str(body.message, 5000)
  const topic = str(body.topic, 5000)
  const rawLink = str(body.linkedin, 300)
  const linkedin = rawLink ? toUrl(rawLink) : ''

  if (!name) return json({error: 'Please fill in your name.'}, 400)
  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)
  if (form === 'contribute' && !linkedin) {
    return json({error: 'Please add a working link to your LinkedIn profile or website.'}, 400)
  }
  if (form === 'contribute' && !topic) return json({error: 'Please add your proposed title or topic.'}, 400)

  // Contribute: who is writing in, for which format, and whether they want the Media Kit.
  // Kept in the message text so the Studio inbox shows it without a schema change.
  const organisation = body.kind === 'organisation'
  const format = FORMATS[str(body.format, 40)]
  const mediaKit = body.mediaKit === true || body.mediaKit === 'on'
  const message =
    form === 'contribute'
      ? [`Writing as: ${organisation ? 'an organisation' : 'an author'}`, format && `Preferred format: ${format}`, mediaKit && 'Please send the Media Kit']
          .filter(Boolean)
          .join('\n')
      : messageText

  const subject = form === 'contribute' ? (organisation ? 'Organisation proposal' : 'Contribution proposal') : 'Contact form'

  // `private.` ids are never served by the public dataset API (Sanity free plan datasets are public).
  await writeClient.create({
    _id: `private.message-${crypto.randomUUID()}`,
    _type: 'contactMessage',
    handled: false,
    form,
    name,
    email,
    subject,
    message,
    linkedin,
    topic,
    createdAt: new Date().toISOString(),
  })

  if (emailEnabled()) {
    const settings = await getSettings()
    if (settings.contactEmail) {
      const rows = [
        `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>`,
        linkedin && `<p>Profile or website: <a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a></p>`,
        topic && `<p><strong>Proposed title or topic</strong><br>${escapeHtml(topic).replace(/\n/g, '<br>')}</p>`,
        message && `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      ]
      await sendEmail({
        to: settings.contactEmail,
        replyTo: email,
        subject: `${subject} — ${name}`,
        html: layout({
          title: subject,
          body: rows.filter(Boolean).join(''),
          footer: 'Reply to this email to answer directly.',
        }),
      }).catch((e) => console.error('[contact] email failed', e))
    }
  }

  return json({
    message:
      form === 'contribute'
        ? 'Thank you. Your proposal has been sent to the editors.'
        : 'Thank you for your message. It has been sent.',
  })
}
