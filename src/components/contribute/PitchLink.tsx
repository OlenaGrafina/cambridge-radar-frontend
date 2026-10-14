'use client'

/**
 * A link to the pitch form that also tells the form which format was
 * chosen, so "Propose an Interview" arrives with Interview selected.
 */
export function PitchLink({format, className, children}: {format?: string; className?: string; children: React.ReactNode}) {
  return (
    <a
      href="#pitch"
      className={className}
      onClick={() => {
        if (format) window.dispatchEvent(new CustomEvent('pitch-format', {detail: format}))
      }}
    >
      {children}
    </a>
  )
}
