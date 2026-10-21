import { CreditCard, FileCheck, HandHeart, LockKeyhole, ShieldCheck, Siren, Stethoscope } from 'lucide-react'
import { safety } from '@/content/landing'
import { SectionIntro } from '../ui'

const icons = {
  doctor: Stethoscope,
  emergency: Siren,
  private: LockKeyhole,
  consent: HandHeart,
  payments: CreditCard,
  prescription: FileCheck,
}

export function Safety() {
  return (
    <section id="safety" aria-labelledby="safety-title" className="relative isolate py-16 lg:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-[#f2efff] to-transparent" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionIntro id="safety-title" label={safety.label} title={safety.title} body={safety.body} />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {safety.items.map((item) => {
            const Icon = icons[item.icon]
            const urgent = item.icon === 'emergency'
            return (
              <article key={item.title} className="card reveal p-7">
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${urgent ? 'bg-rose-50 text-rose-500' : 'bg-lilac text-brand'}`}
                >
                  <Icon aria-hidden className="size-6" />
                </span>
                <h3 className="mt-6 font-display text-[21px] font-medium tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{item.body}</p>
              </article>
            )
          })}
        </div>
        <p className="mx-auto mt-10 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[14px] text-ink-2 shadow-sm">
          <ShieldCheck aria-hidden className="size-5 shrink-0 text-brand" />
          {safety.footnote}
        </p>
      </div>
    </section>
  )
}
