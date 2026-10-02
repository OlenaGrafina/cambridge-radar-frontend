import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {title: 'Subscription', robots: {index: false, follow: false}}

const COPY: Record<string, {title: string; text: string}> = {
  confirmed: {title: 'You’re on the list.', text: 'New analysis from Cambridge Radar will arrive in your inbox. Thank you for reading.'},
  unsubscribed: {title: 'You’ve been unsubscribed.', text: 'You will not receive any more emails from us. You can sign up again at any time.'},
  invalid: {title: 'This link has expired.', text: 'The link is invalid or was already used. Try signing up again from any article.'},
}

export default async function SubscriptionPage({searchParams}: {searchParams: Promise<{status?: string}>}) {
  const {status = 'invalid'} = await searchParams
  const copy = COPY[status] ?? COPY.invalid
  return (
    <div className="shell pt-page pb-section">
      <p className="meta">Newsletter</p>
      <h1 className="t-display mt-6 max-w-4xl">{copy.title}</h1>
      <p className="t-lead mt-6 max-w-xl text-ink-2">{copy.text}</p>
      <Link href="/" className="btn btn-ink mt-10">
        Back to the front page
      </Link>
    </div>
  )
}
