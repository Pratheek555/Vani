import type { Metadata, Viewport } from 'next'
import { Caveat, Inter, Inter_Tight } from 'next/font/google'
import { site } from '@/content/landing'
import './globals.css'

// latin-ext carries the rupee sign (U+20B9).
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const interTight = Inter_Tight({ subsets: ['latin', 'latin-ext'], variable: '--font-inter-tight' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', weight: '600' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, siteName: 'Vani', type: 'website' },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
}

export const viewport: Viewport = { themeColor: '#fcfdff' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${inter.variable} ${interTight.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
