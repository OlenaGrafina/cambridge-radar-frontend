'use client'

import {useId} from 'react'

import {CheckIcon} from '@/components/icons'

import {Turnstile} from './Turnstile'
import {Honeypot, useFormPost} from './useFormPost'

export function ContactForm() {
  const id = useId()
  const {status, message, submit, onToken, resetKey, setStatus} = useFormPost('/api/contact', {event: 'generate_lead', params: {form: 'contact'}})

  if (status === 'done') {
    return (
      <div role="status" className="border-t border-rule-strong pt-6">
        <p className="t-lead flex items-start gap-3">
          <CheckIcon className="mt-1 shrink-0 text-signal" />
          {message ?? 'Thank you for your message. It has been sent.'}
        </p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      className="relative grid gap-5 border-t border-rule-strong pt-6"
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget)
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2" htmlFor={`${id}-name`}>
          <span className="kicker">Name</span>
          <input id={`${id}-name`} name="name" required autoComplete="name" className="field" />
        </label>
        <label className="grid gap-2" htmlFor={`${id}-email`}>
          <span className="kicker">Email</span>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
        </label>
      </div>
      <label className="grid gap-2" htmlFor={`${id}-subject`}>
        <span className="kicker">Subject</span>
        <input id={`${id}-subject`} name="subject" className="field" />
      </label>
      <label className="grid gap-2" htmlFor={`${id}-message`}>
        <span className="kicker">Message</span>
        <textarea id={`${id}-message`} name="message" required rows={6} maxLength={5000} className="field" />
      </label>
      <Honeypot />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {status === 'error' && (
        <p role="alert" className="text-sm text-signal">
          {message}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
