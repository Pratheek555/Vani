import { Cta, Footer } from '@/components/landing/closing'
import { Etiquette } from '@/components/landing/etiquette'
import { Faq } from '@/components/landing/faq'
import { Features } from '@/components/landing/features'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Problem } from '@/components/landing/problem'
import { Rules } from '@/components/landing/rules'
import { Safety } from '@/components/landing/safety'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Etiquette />
        <HowItWorks />
        <Rules />
        <Safety />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
