'use client'

import {useId} from 'react'

import {CheckIcon} from '@/components/icons'

import {Turnstile} from './Turnstile'
import {Honeypot, useFormPost} from './useFormPost'

/**
 * The Contacts form: name, email, message. As with the original Contact
 * Form 7, the form stays in place after sending and the confirmation shows
 * under it. (The Contribute form lives in components/contribute.)
 */
export function ContactForm() {
  const id = useId()
  const {status, message, submit, onToken, resetKey} = useFormPost('/api/contact', {
    event: 'generate_lead',
    params: {form: 'contact'},
  })

  return (
    <form
      className="relative grid gap-5 border-t border-rule-strong pt-6"
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget, {form: 'contact'})
      }}
    >
      <label className="grid gap-2" htmlFor={`${id}-name`}>
        <span className="kicker">Your Name (required)</span>
        <input id={`${id}-name`} name="name" required autoComplete="name" className="field" />
      </label>
      <label className="grid gap-2" htmlFor={`${id}-email`}>
        <span className="kicker">Your Email (required)</span>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="grid gap-2" htmlFor={`${id}-message`}>
        <span className="kicker">Your Message</span>
        <textarea id={`${id}-message`} name="message" rows={6} maxLength={5000} className="field" />
      </label>
      <Honeypot />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {status === 'error' && (
        <p role="alert" className="text-sm text-signal">
          {message}
        </p>
      )}
      {status === 'done' && (
        <p role="status" className="t-ui flex items-start gap-3">
          <CheckIcon className="mt-0.5 shrink-0 text-signal" />
          {message ?? 'Thank you for your message. It has been sent.'}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
