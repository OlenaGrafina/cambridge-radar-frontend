import {getSettings} from '@/lib/data'
import {writeClient} from '@/lib/sanity/client'
import {emailEnabled, escapeHtml, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'

/** Contacts and Contribute forms. Both land in the Studio inbox and, if set up, in the editor's mailbox. */
export async function POST(req: Request) {
  if (!writeClient) return json({error: 'The form is temporarily unavailable. Please email us instead.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'contact', 4)
  if (blocked) return blocked

  const form = body.form === 'contribute' ? 'contribute' : 'contact'
  const name = str(body.name, 100)
  const email = str(body.email, 200).toLowerCase()
  const message = str(body.message, 5000)
  const linkedin = str(body.linkedin, 300)
  const topic = str(body.topic, 5000)

  if (!name) return json({error: 'Please fill in your name.'}, 400)
  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)
  if (form === 'contribute' && (!linkedin || !topic)) {
    return json({error: 'Please add your LinkedIn profile and the proposed title or topic.'}, 400)
  }

  const subject = form === 'contribute' ? 'Contribution proposal' : 'Contact form'

  await writeClient.create({
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
        linkedin && `<p>LinkedIn: <a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a></p>`,
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

  return json({message: 'Thank you for your message. It has been sent.'})
}
