'use client'

import {useEffect, useId, useRef} from 'react'

import {Turnstile} from '@/components/forms/Turnstile'
import {Honeypot, useFormPost} from '@/components/forms/useFormPost'
import {CheckIcon} from '@/components/icons'

/** Same keys as FORMATS in api/contact. */
const FORMATS = [
  {value: '', label: 'Not sure yet'},
  {value: 'article', label: 'Expert Article'},
  {value: 'interview', label: 'Interview'},
  {value: 'perspectives', label: 'Perspectives'},
  {value: 'organisation', label: 'Organisation Feature'},
]

/**
 * The pitch form. Four required fields (name, email, a link that proves who
 * you are, the idea) and two optional ones. Authors and organisations use
 * the same form: a switch at the top says which one is writing in. The link
 * field takes "linkedin.com/in/name" without https://, the server tidies it.
 */
export function ContributeForm() {
  const id = useId()
  const ref = useRef<HTMLFormElement>(null)
  const {status, message, submit, onToken, resetKey} = useFormPost('/api/contact', {
    event: 'generate_lead',
    params: {form: 'contribute'},
  })

  // "Propose an Interview" on a format card picks that format here.
  useEffect(() => {
    const onPick = (e: Event) => {
      const format = (e as CustomEvent<string>).detail
      const form = ref.current
      if (!form) return
      const select = form.elements.namedItem('format') as HTMLSelectElement | null
      if (select) select.value = format
      const kind = form.elements.namedItem('kind') as RadioNodeList | null
      if (kind) kind.value = format === 'organisation' ? 'organisation' : 'author'
    }
    window.addEventListener('pitch-format', onPick)
    return () => window.removeEventListener('pitch-format', onPick)
  }, [])

  return (
    <form
      ref={ref}
      className="relative grid gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        submit(e.currentTarget, {form: 'contribute', mediaKit: data.get('mediaKit') === 'on'})
      }}
    >
      <fieldset className="grid gap-2">
        <legend className="kicker mb-2">I am writing as</legend>
        <div className="grid grid-cols-2 border border-rule-strong">
          {[
            {value: 'author', label: 'An author'},
            {value: 'organisation', label: 'An organisation'},
          ].map((o, i) => (
            <label key={o.value} className={i === 0 ? 'border-r border-rule-strong' : ''}>
              <input type="radio" name="kind" value={o.value} defaultChecked={i === 0} className="peer sr-only" />
              <span className="t-ui block cursor-pointer px-4 py-3 text-center transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-signal hover:bg-paper-2 peer-checked:hover:bg-ink">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2" htmlFor={`${id}-name`}>
          <span className="kicker">Name</span>
          <input id={`${id}-name`} name="name" required autoComplete="name" className="field" />
        </label>
        <label className="grid gap-2" htmlFor={`${id}-email`}>
          <span className="kicker">Email</span>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
        </label>
      </div>

      <label className="grid gap-2" htmlFor={`${id}-link`}>
        <span className="kicker">LinkedIn profile or website</span>
        <input
          id={`${id}-link`}
          name="linkedin"
          required
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="linkedin.com/in/your-name"
          className="field"
        />
      </label>

      <label className="grid gap-2" htmlFor={`${id}-format`}>
        <span className="kicker">
          Format <span className="text-muted">(optional)</span>
        </span>
        <select id={`${id}-format`} name="format" defaultValue="" className="field">
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2" htmlFor={`${id}-topic`}>
        <span className="kicker">Proposed title or topic</span>
        <textarea
          id={`${id}-topic`}
          name="topic"
          required
          rows={6}
          maxLength={5000}
          placeholder="A working title, the idea in two or three sentences, and why it matters now."
          className="field"
        />
      </label>

      <label className="t-ui flex items-start gap-3 text-ink-2" htmlFor={`${id}-kit`}>
        <input id={`${id}-kit`} type="checkbox" name="mediaKit" className="mt-0.5 size-4 shrink-0 accent-[var(--signal)]" />
        <span>Send me the Media Kit as well.</span>
      </label>

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
          {message ?? 'Thank you. Your proposal has been sent to the editors.'}
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send my proposal'}
        </button>
      </div>
    </form>
  )
}
