'use client'

import {useId, useState} from 'react'

import {Honeypot, useFormPost} from '@/components/forms/useFormPost'
import {Turnstile} from '@/components/forms/Turnstile'
import {CheckIcon, ReplyIcon} from '@/components/icons'

/**
 * Comment form. No account needed — name, email and text. Comments go to
 * the editor first; nothing appears on the page until it is approved.
 * As a reply it starts collapsed behind a "Reply" button.
 */
export function CommentForm({postId, parentId, parentName}: {postId: string; parentId?: string; parentName?: string}) {
  const id = useId()
  const [open, setOpen] = useState(!parentId)
  const {status, message, submit, onToken, resetKey, setStatus} = useFormPost('/api/comments')

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="meta mt-3 flex items-center gap-1.5 hover:text-ink">
        <ReplyIcon size={14} /> Reply
      </button>
    )
  }

  if (status === 'done') {
    return (
      <div role="status" className="mt-4 flex items-start gap-3 bg-paper-2 p-4 font-serif text-[1.0625rem] leading-snug">
        <CheckIcon className="mt-0.5 shrink-0 text-signal" />
        <div>
          {message ?? 'Thank you. Your comment will appear once an editor has reviewed it.'}
          {!parentId && (
            <button type="button" className="meta mt-2 block hover:text-ink" onClick={() => setStatus('idle')}>
              Write another
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      className="relative mt-4 grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget, {postId, parentId})
      }}
    >
      {!parentId && <p className="kicker">Leave a comment</p>}
      {parentId && <p className="meta">Replying to {parentName}</p>}
      <label htmlFor={`${id}-body`} className="sr-only">
        Comment
      </label>
      <textarea
        id={`${id}-body`}
        name="body"
        required
        minLength={2}
        maxLength={5000}
        rows={parentId ? 3 : 5}
        placeholder="Share a thought, a counterpoint or a source…"
        className="field font-serif text-[1.0625rem]"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5" htmlFor={`${id}-name`}>
          <span className="meta">Name</span>
          <input id={`${id}-name`} name="name" required maxLength={80} autoComplete="name" className="field" />
        </label>
        <label className="grid gap-1.5" htmlFor={`${id}-email`}>
          <span className="meta">Email · never published</span>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
        </label>
      </div>
      <label className="flex items-center gap-2.5 text-[14px] text-ink-2">
        <input type="checkbox" name="notify" value="yes" className="h-4 w-4 accent-[var(--signal)]" />
        Email me when someone replies
      </label>
      <Honeypot />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {status === 'error' && (
        <p role="alert" className="text-sm text-signal">
          {message}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : parentId ? 'Post reply' : 'Post comment'}
        </button>
        {parentId && (
          <button type="button" className="meta hover:text-ink" onClick={() => setOpen(false)}>
            Cancel
          </button>
        )}
        <p className="meta ml-auto hidden normal-case tracking-normal sm:block">Reviewed before publishing</p>
      </div>
    </form>
  )
}
