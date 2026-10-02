import type {MetadataRoute} from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cambridge Radar',
    short_name: 'Radar',
    description: 'Signals of What’s Next — independent analysis from Cambridge.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b0b0c',
    icons: [
      {src: '/icon.svg', sizes: 'any', type: 'image/svg+xml'},
      {src: '/apple-icon', sizes: '180x180', type: 'image/png'},
    ],
  }
}
