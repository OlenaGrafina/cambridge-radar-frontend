'use client'

import {useId} from 'react'

import {ArrowRight, CheckIcon} from '@/components/icons'
import {cn} from '@/lib/utils'

import {Turnstile} from './Turnstile'
import {Honeypot, useFormPost} from './useFormPost'

export function NewsletterForm({source, compact = false}: {source: string; compact?: boolean}) {
  const id = useId()
  const {status, message, submit, onToken, resetKey} = useFormPost('/api/subscribe')

  if (status === 'done') {
    return (
      <p role="status" className="flex items-start gap-3 font-serif text-[1.0625rem] leading-snug">
        <CheckIcon className="mt-0.5 shrink-0 text-signal" />
        {message ?? 'Almost there — check your inbox to confirm your subscription.'}
      </p>
    )
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget, {source})
      }}
    >
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div className={cn('flex', compact ? 'gap-0' : 'flex-col gap-2 sm:flex-row sm:gap-0')}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="field min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className={cn('btn btn-signal shrink-0', compact && 'w-11 px-0')}
          aria-label={compact ? 'Subscribe' : undefined}
        >
          {compact ? <ArrowRight /> : status === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <Honeypot />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {status === 'error' && (
        <p role="alert" className="mt-2 text-sm text-signal">
          {message}
        </p>
      )}
      {!compact && (
        <p className="meta mt-3 normal-case tracking-normal">One email per new article. Unsubscribe in one click.</p>
      )}
    </form>
  )
}
