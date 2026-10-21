import { ArrowUpRight } from 'lucide-react'
import { cta, footer, links, nav } from '@/content/landing'
import { Lines, Logo, Orb } from '../ui'

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="rays reveal relative isolate overflow-hidden rounded-[36px] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <Orb className="absolute -top-24 -right-20 -z-10 size-72 opacity-50 blur-2xl" />
        <Orb className="absolute -bottom-28 -left-24 -z-10 size-72 opacity-40 blur-3xl" />
        <h2 id="cta-title" className="font-display text-[clamp(2.2rem,5vw,3.9rem)] leading-[1.02] font-medium tracking-[-0.04em]">
          <Lines text={cta.title} />
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg text-pretty text-white/80">{cta.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={links.signup}
            className="group inline-flex h-14 items-center gap-4 rounded-full bg-white pr-1.5 pl-7 text-[17px] font-medium text-brand-deep transition hover:bg-lilac"
          >
            {cta.primary}
            <span className="grid size-11 place-items-center rounded-full bg-brand text-white transition group-hover:rotate-45">
              <ArrowUpRight aria-hidden className="size-5" />
            </span>
          </a>
          <a
            href={links.login}
            className="inline-flex h-14 items-center rounded-full border border-white/35 px-7 text-[17px] font-medium transition hover:bg-white/10"
          >
            {cta.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">{footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap content-start gap-x-8 gap-y-3 text-[15px] text-ink-2 md:justify-end">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </a>
          ))}
          <a href={links.login} className="transition hover:text-brand">
            Log in
          </a>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-line px-5 py-6 text-[13px] text-ink-3 sm:px-8 md:flex-row md:justify-between">
        <p>{footer.disclaimer}</p>
        <p className="shrink-0">{footer.credit} · © 2026 Vani</p>
      </div>
    </footer>
  )
}
