import { ArrowUpRight } from 'lucide-react'

export function Orb({ className = 'size-7' }: { className?: string }) {
  return <span aria-hidden className={`orb inline-block shrink-0 ${className}`} />
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Orb className="size-8" />
      <span className="font-display text-[26px] font-semibold tracking-[-0.04em] text-brand">Vani</span>
    </span>
  )
}

/** Violet pill with the white arrow disc, as in the reference's "Get Started Free". */
export function PrimaryButton({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group inline-flex h-14 items-center gap-4 rounded-full bg-brand pl-7 pr-1.5 text-[17px] font-medium text-white shadow-[0_0_0_4px_rgb(106_71_254/0.16),0_10px_24px_-10px_rgb(106_71_254/0.8)] transition hover:bg-brand-deep ${className}`}
    >
      {children}
      <span className="grid size-11 place-items-center rounded-full bg-white text-brand transition group-hover:rotate-45">
        <ArrowUpRight className="size-5" strokeWidth={2} />
      </span>
    </a>
  )
}

export function SecondaryButton({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex h-14 items-center gap-2.5 rounded-full border border-line bg-white px-7 text-[17px] font-medium text-ink shadow-[0_8px_24px_-12px_rgb(23_22_29/0.25)] transition hover:border-ink/15 ${className}`}
    >
      {children}
    </a>
  )
}

export function Label({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  const look = tone === 'light' ? 'border-line bg-white text-ink-2' : 'border-white/20 bg-white/10 text-white/85'
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[13px] font-medium ${look}`}>{children}</span>
}

export function SectionIntro({
  label,
  title,
  body,
  align = 'center',
  id,
}: {
  label: string
  title: string | readonly string[]
  body?: string
  align?: 'center' | 'left'
  id?: string
}) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <Label>{label}</Label>
      <h2 id={id} className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance">
        <Lines text={title} />
      </h2>
      {body && <p className={`mt-5 text-lg leading-relaxed text-pretty text-ink-2 ${centered ? 'mx-auto max-w-xl' : ''}`}>{body}</p>}
    </div>
  )
}

/** Multi-sentence headlines break one sentence per line. */
export function Lines({ text }: { text: string | readonly string[] }) {
  if (typeof text === 'string') return text
  return text.map((line) => (
    <span key={line} className="block">
      {line}
    </span>
  ))
}
