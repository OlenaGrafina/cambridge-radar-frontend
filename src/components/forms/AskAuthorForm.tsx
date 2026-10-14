'use client'

import {useId} from 'react'

import {CheckIcon} from '@/components/icons'

import {Turnstile} from './Turnstile'
import {Honeypot, useFormPost} from './useFormPost'

/**
 * "Ask the author" at the end of an article: a question and an email, name
 * optional. It works like a comment box that only the editors read. The
 * article is sent as a slug and the server looks up its title and author, so
 * the message always names the right ones.
 */
export function AskAuthorForm({article, authorName, editorial}: {article: string; authorName: string; editorial?: boolean}) {
  const id = useId()
  const who = editorial ? 'the editors' : authorName
  const {status, message, submit, onToken, resetKey} = useFormPost('/api/ask-author', {
    event: 'generate_lead',
    params: {form: 'ask_author', article},
  })

  return (
    <aside aria-labelledby={`${id}-title`} className="bg-paper-2 p-6 md:p-8">
      <h2 id={`${id}-title`} className="t-h3">
        Ask {who} a question
      </h2>
      <p className="t-body-sm mt-2 text-ink-2">
        Something this article left open? Send your question. The editors will pass it on to {editorial ? 'the team' : authorName}.
      </p>

      <form
        className="relative mt-6 grid gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          submit(e.currentTarget, {article})
        }}
      >
        <label className="grid gap-2" htmlFor={`${id}-question`}>
          <span className="kicker">Your question</span>
          <textarea id={`${id}-question`} name="question" required minLength={5} rows={4} maxLength={2000} className="field" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2" htmlFor={`${id}-email`}>
            <span className="kicker">Your email</span>
            <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label className="grid gap-2" htmlFor={`${id}-name`}>
            <span className="kicker">
              Your name <span className="text-muted">(optional)</span>
            </span>
            <input id={`${id}-name`} name="name" autoComplete="name" className="field" />
          </label>
        </div>
        <Honeypot />
        <Turnstile onToken={onToken} resetKey={resetKey} />
        {status === 'error' && (
          <p role="alert" className="t-ui text-signal">
            {message}
          </p>
        )}
        {status === 'done' && (
          <p role="status" className="t-ui flex items-start gap-3">
            <CheckIcon className="mt-0.5 shrink-0 text-signal" />
            {message ?? 'Thank you. Your question has been sent.'}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send question'}
          </button>
          <p className="t-ui-sm text-muted">The editors reply to the email you leave here.</p>
        </div>
      </form>
    </aside>
  )
}
