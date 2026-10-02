/**
 * Email through Resend's HTTP API (plain fetch — runs on Cloudflare too).
 * Without RESEND_API_KEY nothing is sent and callers carry on: everything
 * is stored in Sanity first, email is only the notification.
 */

type Mail = {to: string | string[]; subject: string; html: string; text?: string; replyTo?: string; headers?: Record<string, string>}

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY)

const FROM = () => process.env.EMAIL_FROM || 'Cambridge Radar <radar@cambridge-radar.com>'

export async function sendEmail(mail: Mail) {
  const key = process.env.RESEND_API_KEY
  if (!key) return {skipped: true as const}
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      from: FROM(),
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo,
      headers: mail.headers,
    }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  return {skipped: false as const}
}

/** Up to 100 messages per call. */
export async function sendBatch(mails: Mail[]) {
  const key = process.env.RESEND_API_KEY
  if (!key || !mails.length) return {skipped: true as const}
  for (let i = 0; i < mails.length; i += 100) {
    const chunk = mails.slice(i, i + 100).map((m) => ({
      from: FROM(),
      to: m.to,
      subject: m.subject,
      html: m.html,
      text: m.text,
      headers: m.headers,
    }))
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(chunk),
    })
    if (!res.ok) throw new Error(`Resend batch ${res.status}: ${await res.text()}`)
  }
  return {skipped: false as const}
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Minimal, client-safe email layout: one column, serif, black on white. */
export function layout({title, body, footer}: {title: string; body: string; footer?: string}) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f4;padding:32px 12px;font-family:Georgia,'Times New Roman',serif;color:#0b0b0c">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-top:3px solid #0b0b0c">
<tr><td style="padding:28px 32px 8px;font-family:Georgia,serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase">Cambridge Radar</td></tr>
<tr><td style="padding:8px 32px 0;font-size:26px;line-height:1.2">${escape(title)}</td></tr>
<tr><td style="padding:16px 32px 28px;font-size:17px;line-height:1.6;color:#3a3a3d">${body}</td></tr>
${footer ? `<tr><td style="padding:16px 32px 28px;border-top:1px solid #e4e4e6;font-family:Arial,sans-serif;font-size:12px;color:#6b6b70">${footer}</td></tr>` : ''}
</table></td></tr></table></body></html>`
}

export {escape as escapeHtml}
