import type {SVGProps} from 'react'

type IconProps = SVGProps<SVGSVGElement> & {size?: number}

function Icon({size = 18, children, ...props}: IconProps & {children: React.ReactNode}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
)

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
)

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icon>
)

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Icon>
)

export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Icon>
)

export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
)

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Icon>
)

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </Icon>
)

export const RssIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4.5a14.5 14.5 0 0 1 14.5 14.5M5 10.5A8.5 8.5 0 0 1 13.5 19" />
    <circle cx="6" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
)

export const ReplyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 7 4 12l5 5" />
    <path d="M4 12h10a6 6 0 0 1 6 6v1" />
  </Icon>
)

/* Brand marks — filled, simplified, single colour. */

function Brand({size = 16, children, ...props}: IconProps & {children: React.ReactNode}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  )
}

export const LinkedInIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.02c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4V9.75Z" />
  </Brand>
)

export const XIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z" />
  </Brand>
)

export const FacebookIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a20.9 20.9 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.15H7.92v2.94h2.54V21h3.04Z" />
  </Brand>
)

export const TelegramIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M20.66 4.2 2.93 11.04c-1.2.48-1.2 1.16-.22 1.46l4.55 1.42 1.74 5.35c.21.58.1.81.72.81.48 0 .69-.22.96-.48l2.3-2.24 4.79 3.54c.88.49 1.52.24 1.74-.82l3.14-14.8c.32-1.29-.5-1.87-1.99-1.08ZM8.6 13.62l9.7-6.12c.48-.29.92-.13.56.19l-8.3 7.49-.33 3.44-1.63-5Z" />
  </Brand>
)

export const ThreadsIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M16.9 11.3a6.6 6.6 0 0 0-.25-.12c-.15-2.72-1.64-4.28-4.13-4.3h-.03c-1.49 0-2.73.64-3.49 1.8l1.37.94c.57-.86 1.46-1.04 2.12-1.04h.02c.82 0 1.44.24 1.84.71.29.34.49.81.58 1.4a10.8 10.8 0 0 0-2.38-.11c-2.4.14-3.94 1.53-3.84 3.47.05.98.54 1.83 1.38 2.38.7.47 1.62.7 2.57.64 1.26-.07 2.24-.55 2.93-1.43.52-.67.85-1.53.99-2.62.6.36 1.04.83 1.29 1.4.42.97.45 2.55-.85 3.84-1.13 1.13-2.49 1.62-4.54 1.63-2.27-.02-4-.75-5.12-2.17-1.05-1.33-1.6-3.25-1.62-5.71.02-2.46.57-4.38 1.62-5.71 1.12-1.42 2.85-2.15 5.12-2.17 2.29.02 4.03.75 5.19 2.18.57.7 1 1.58 1.28 2.61l1.6-.43c-.34-1.27-.88-2.36-1.62-3.27-1.49-1.84-3.68-2.78-6.5-2.8h-.01c-2.82.02-4.98.97-6.44 2.82C2.68 7.32 2.02 9.6 2 12.42v.02c.02 2.82.68 5.1 1.97 6.74 1.46 1.85 3.62 2.8 6.44 2.82h.01c2.5-.02 4.27-.67 5.73-2.13 1.9-1.9 1.85-4.29 1.22-5.75-.45-1.05-1.31-1.9-2.47-2.47Zm-4.32 4.06c-1.05.06-2.14-.41-2.2-1.42-.04-.75.53-1.58 2.26-1.68.2-.01.39-.02.58-.02.63 0 1.22.06 1.75.18-.2 2.49-1.37 2.88-2.39 2.94Z" />
  </Brand>
)

export const PinterestIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M12.04 2C6.5 2 3.7 5.97 3.7 9.28c0 2 .76 3.79 2.4 4.45.27.11.5 0 .58-.29l.24-.92c.08-.29.05-.39-.17-.64-.47-.56-.77-1.28-.77-2.3 0-2.96 2.22-5.6 5.77-5.6 3.14 0 4.87 1.92 4.87 4.49 0 3.37-1.49 6.22-3.71 6.22-1.22 0-2.14-1.01-1.85-2.25.35-1.48 1.03-3.08 1.03-4.15 0-.96-.51-1.76-1.58-1.76-1.25 0-2.26 1.29-2.26 3.03 0 1.1.37 1.85.37 1.85l-1.5 6.36c-.45 1.89-.07 4.2-.03 4.43.02.14.2.17.28.07.11-.15 1.62-2.01 2.13-3.86.15-.52.83-3.24.83-3.24.41.79 1.61 1.48 2.88 1.48 3.79 0 6.36-3.45 6.36-8.08C19.57 5.36 16.61 2 12.04 2Z" />
  </Brand>
)

export const InstagramIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
)

export const YouTubeIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </Brand>
)

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" />
  </Icon>
)

export function SocialIcon({network, size}: {network: string; size?: number}) {
  switch (network) {
    case 'linkedin':
      return <LinkedInIcon size={size} />
    case 'x':
      return <XIcon size={size} />
    case 'facebook':
      return <FacebookIcon size={size} />
    case 'telegram':
      return <TelegramIcon size={size} />
    case 'instagram':
      return <InstagramIcon size={size} />
    case 'youtube':
      return <YouTubeIcon size={size} />
    default:
      return <GlobeIcon size={size} />
  }
}

export const NETWORK_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  facebook: 'Facebook',
  telegram: 'Telegram',
  instagram: 'Instagram',
  youtube: 'YouTube',
  website: 'Website',
}
