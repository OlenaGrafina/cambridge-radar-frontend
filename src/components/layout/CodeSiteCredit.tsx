/** Studio credit, as on every code-site.art build: tiny caption + wordmark link with the tag icon. */
export function CodeSiteCredit() {
  return (
    <div className="shrink-0 text-ink/70">
      <p className="text-[7px] leading-[1.2] tracking-[0.04em] uppercase">Created by</p>
      <a
        href="https://code-site.art"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] leading-[1.2] font-medium tracking-[0.02em] uppercase transition-opacity duration-300 hover:opacity-80"
      >
        Code-site.art
        <svg width="18" height="17" viewBox="0 0 18 17" fill="none" aria-hidden="true" className="mb-1 shrink-0">
          <path d="M6.70215 16.6336L10.2077 3.6084H11.342L7.47546 16.6336H6.70215Z" fill="currentColor" />
          <path d="M12.3976 16.0546V14.6925L16.2396 11.857L12.373 9.02154L12.3976 7.80518L17.0129 11.0695V12.79L12.3976 16.0546Z" fill="currentColor" />
          <path d="M4.61535 15.9823V14.6203L0.773314 11.7848L4.63989 8.94927L4.61535 7.73291L4.14848e-05 10.9972V12.7178L4.61535 15.9823Z" fill="currentColor" />
          <path
            d="M12.5389 4.6733C11.9997 5.21253 10.0225 5.57201 10.0225 5.57201C10.0225 5.57201 9.12381 3.4151 9.30355 2.69614C9.4833 1.97717 10.0225 1.43794 10.0225 1.43794C10.9444 0.46301 11.6776 0.245598 13.0781 0C13.3398 1.86884 13.0781 4.13407 12.5389 4.6733Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  )
}
