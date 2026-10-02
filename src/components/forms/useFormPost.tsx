'use client'

import {useCallback, useState} from 'react'

import {track} from '@/lib/analytics'

export type FormStatus = 'idle' | 'sending' | 'done' | 'error'

/** Posts JSON to an API route and tracks the state for the form UI. */
export function useFormPost(endpoint: string, analytics?: {event: string; params?: Record<string, string | number | boolean | undefined>}) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [resetKey, setResetKey] = useState(0)

  const onToken = useCallback((t: string) => setToken(t), [])

  async function submit(form: HTMLFormElement, extra: Record<string, unknown> = {}) {
    setStatus('sending')
    setMessage(null)
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...data, ...extra, turnstileToken: token}),
      })
      const json = (await res.json().catch(() => ({}))) as {message?: string; error?: string}
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.')
      setStatus('done')
      if (analytics) track(analytics.event, analytics.params)
      setMessage(json.message ?? null)
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setResetKey((k) => k + 1)
    }
  }

  return {status, message, submit, onToken, resetKey, setStatus}
}

/** Off-screen field bots fill in and people never see. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
