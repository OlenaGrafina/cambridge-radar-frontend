import {ImageResponse} from 'next/og'

export const alt = 'Cambridge Radar — Signals of What’s Next'
export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

/** Default share card for pages without their own image. */
export default function OpengraphImage() {
  const rings = [140, 240, 340, 440, 540]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0c0c0d',
          color: '#ededeb',
          padding: '64px 72px',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {rings.map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              right: 140 - r / 2,
              top: 315 - r / 2,
              width: r,
              height: r,
              borderRadius: '50%',
              border: '1px solid #2a2a2d',
            }}
          />
        ))}
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, letterSpacing: 4, color: '#8e8e93'}}>
          <div style={{width: 10, height: 10, borderRadius: 10, background: '#ff6a4a'}} />
          INDEPENDENT ANALYSIS
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{fontSize: 108, letterSpacing: 2, lineHeight: 1}}>CAMBRIDGE RADAR</div>
          <div style={{marginTop: 24, fontSize: 30, color: '#bdbdb8'}}>Signals of What’s Next</div>
        </div>
        <div style={{display: 'flex', borderTop: '1px solid #2a2a2d', paddingTop: 20, fontSize: 20, letterSpacing: 3, color: '#8e8e93'}}>
          BUSINESS · TECHNOLOGY · AI · LEADERSHIP · ECONOMY · GEOPOLITICS
        </div>
      </div>
    ),
    size,
  )
}
