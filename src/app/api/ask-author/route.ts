import {getSettings} from '@/lib/data'
import {sanityFetch, writeClient} from '@/lib/sanity/client'
import {askAuthorTargetQuery} from '@/lib/sanity/queries'
import {emailEnabled, escapeHtml, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'
import {absolute} from '@/lib/utils'

type Target = {title: string; section?: string; author?: string} | null

/**
 * "Ask the author" under every article. The reader leaves an email and a
 * question; it lands in the Studio inbox as a Contacts message and in the
 * editors' mailbox (Site settings → contact email) with the article and the
 * author named, and Reply goes straight to the reader.
 *
 * The article and its author are read from Sanity by slug, never taken from
 * the form, so a message cannot be labelled with someone else's name.
 */
export async function POST(req: Request) {
  if (!writeClient) return json({error: 'The form is temporarily unavailable. Please email us instead.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'ask-author', 4)
  if (blocked) return blocked

  const email = str(body.email, 200).toLowerCase()
  const name = str(body.name, 100)
  const question = str(body.question, 2000)
  const slug = str(body.article, 200)

  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)
  if (question.length < 5) return json({error: 'Please write your question.'}, 400)
  if (!slug) return json({error: 'Something went wrong. Please reload the page and try again.'}, 400)

  const target = await sanityFetch<Target>(askAuthorTargetQuery, {slug}).catch(() => null)
  if (!target) return json({error: 'We could not find that article. Please reload the page and try again.'}, 404)

  const author = target.author || 'the author'
  const url = target.section ? absolute(`/${target.section}/${slug}`) : absolute('/')
  const subject = `Question for ${author}`

  // `private.` ids are never served by the public dataset API (Sanity free plan datasets are public).
  await writeClient.create({
    _id: `private.message-${crypto.randomUUID()}`,
    _type: 'contactMessage',
    handled: false,
    form: 'contact',
    name,
    email,
    subject: `${subject}: ${target.title}`,
    message: `${question}\n\n— Article: ${target.title}\n— Author: ${author}\n— ${url}`,
    createdAt: new Date().toISOString(),
  })

  if (emailEnabled()) {
    const settings = await getSettings()
    if (settings.contactEmail) {
      const who = name ? `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;` : `&lt;${escapeHtml(email)}&gt;`
      await sendEmail({
        to: settings.contactEmail,
        replyTo: email,
        subject: `${subject}: ${target.title}`,
        html: layout({
          title: subject,
          body: [
            `<p><strong>${who}</strong> asks <strong>${escapeHtml(author)}</strong>:</p>`,
            `<p>${escapeHtml(question).replace(/\n/g, '<br>')}</p>`,
            `<p>About “${escapeHtml(target.title)}”<br><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
          ].join(''),
          footer: `Reply to this email to answer the reader directly. Pass the question on to ${escapeHtml(author)} if needed.`,
        }),
      }).catch((e) => console.error('[ask-author] email failed', e))
    }
  }

  return json({message: `Thank you. Your question has been sent to the editors, who will pass it on to ${author}.`})
}
