import {getSettings} from '@/lib/data'
import {writeClient} from '@/lib/sanity/client'
import {emailEnabled, escapeHtml, layout, sendEmail} from '@/lib/server/email'
import {EMAIL_RE, guard, json, str} from '@/lib/server/guard'

const STUDIO_URL = process.env.SANITY_STUDIO_URL || 'https://cambridge-radar.sanity.studio'

export async function POST(req: Request) {
  if (!writeClient) return json({error: 'Comments are temporarily unavailable.'}, 503)

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const blocked = await guard(req, body, 'comment', 6)
  if (blocked) return blocked

  const postId = str(body.postId, 100)
  const parentId = str(body.parentId, 100)
  const name = str(body.name, 80)
  const email = str(body.email, 200).toLowerCase()
  const text = str(body.body, 5000)

  if (!postId || !name || text.length < 2) return json({error: 'Please fill in your name and comment.'}, 400)
  if (!EMAIL_RE.test(email)) return json({error: 'Please enter a valid email address.'}, 400)
  if (/(https?:\/\/[^\s]+[\s\S]*){4,}/i.test(text)) return json({error: 'Please include fewer links.'}, 400)

  const post = await writeClient.fetch<{_id: string; title: string; allowComments?: boolean} | null>(
    `*[_type == "post" && _id == $id && !(_id in path("drafts.**"))][0]{_id, title, allowComments}`,
    {id: postId},
  )
  if (!post || post.allowComments === false) return json({error: 'Comments are closed for this article.'}, 400)

  if (parentId) {
    const parentOk = await writeClient.fetch<boolean>(
      `count(*[_type == "comment" && _id == $id && post._ref == $post && status == "approved"]) > 0`,
      {id: parentId, post: postId},
    )
    if (!parentOk) return json({error: 'The comment you are replying to is no longer available.'}, 400)
  }

  const doc = await writeClient.create({
    _type: 'comment',
    status: 'pending',
    post: {_type: 'reference', _ref: postId, _weak: true},
    ...(parentId ? {parent: {_type: 'reference', _ref: parentId, _weak: true}} : {}),
    name,
    email,
    body: text,
    notifyOnReply: body.notify === 'yes',
    createdAt: new Date().toISOString(),
  })

  // Tell the editor there is something to review. Failure here must not lose the comment.
  if (emailEnabled()) {
    const settings = await getSettings()
    if (settings.contactEmail) {
      sendEmail({
        to: settings.contactEmail,
        replyTo: email,
        subject: `New comment on “${post.title}”`,
        html: layout({
          title: 'A comment is waiting for review',
          body: `<p><strong>${escapeHtml(name)}</strong> on <em>${escapeHtml(post.title)}</em>:</p>
<blockquote style="margin:16px 0;padding-left:16px;border-left:2px solid #0b0b0c">${escapeHtml(text).replace(/\n/g, '<br>')}</blockquote>
<p><a href="${STUDIO_URL}/structure/comment;${doc._id}" style="color:#c8361b">Review in the admin →</a></p>`,
        }),
      }).catch((e) => console.error('[comments] notify failed', e))
    }
  }

  return json({message: 'Thank you. Your comment will appear once an editor has reviewed it.'})
}
