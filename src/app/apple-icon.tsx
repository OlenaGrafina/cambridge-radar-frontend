import {ImageResponse} from 'next/og'

export const size = {width: 180, height: 180}
export const contentType = 'image/png'

/** Home-screen icon: the radar mark from icon.svg, drawn for iOS. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0b0c'}}>
        <div style={{position: 'absolute', width: 124, height: 124, borderRadius: 124, border: '7px solid #ededeb'}} />
        <div style={{position: 'absolute', width: 72, height: 72, borderRadius: 72, border: '7px solid #ededeb'}} />
        <div style={{width: 26, height: 26, borderRadius: 26, background: '#ff6a4a'}} />
      </div>
    ),
    size,
  )
}
