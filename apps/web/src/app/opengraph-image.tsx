import { ImageResponse } from 'next/og'
import { hero } from '@/content/landing'

// The preview card people see when the link is shared in WhatsApp or Telegram.
export const alt = 'Vani: your parents ask, Vani takes care of it'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const orb =
  'radial-gradient(circle at 34% 30%, #ffffff 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 70% 72%, #ffb547 0%, rgba(255,181,71,0) 46%), radial-gradient(circle at 26% 74%, #5cc8ff 0%, rgba(92,200,255,0) 50%), radial-gradient(circle at 60% 40%, #f25cf0 0%, rgba(242,92,240,0) 58%), linear-gradient(#7b5cff, #7b5cff)'

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 96px',
        backgroundColor: '#fcfdff',
        backgroundImage:
          'radial-gradient(circle at 12% 95%, #dfe7ff 0%, rgba(223,231,255,0) 45%), radial-gradient(circle at 92% 8%, #e7e1ff 0%, rgba(231,225,255,0) 40%)',
        color: '#17161d',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, backgroundImage: orb }} />
        <div style={{ fontSize: 56, color: '#6a47fe', letterSpacing: -2 }}>Vani</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 44, fontSize: 84, lineHeight: 1.02, letterSpacing: -4 }}>
        {hero.title.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div style={{ marginTop: 32, fontSize: 32, color: '#4c4b58', maxWidth: 900, lineHeight: 1.35 }}>
        Groceries, medicine refills, lab reports and doctor visits for your parents in India, handled in your family group chat.
      </div>
    </div>,
    size,
  )
}
