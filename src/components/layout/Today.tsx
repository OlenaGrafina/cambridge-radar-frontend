'use client'

import {useEffect, useState} from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})

/** Today's date. Rendered on the client so static pages never show a stale day. */
export function Today() {
  const [today, setToday] = useState<string | null>(null)
  useEffect(() => setToday(fmt.format(new Date())), [])
  return <time suppressHydrationWarning>{today ?? 'Cambridge, UK'}</time>
}
