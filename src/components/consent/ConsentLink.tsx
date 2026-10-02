'use client'

import {OPEN_CONSENT_EVENT} from './ConsentManager'

export function ConsentLink({className}: {className?: string}) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Cookie settings
    </button>
  )
}
