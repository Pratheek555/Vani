import { Plus } from 'lucide-react'
import { faq } from '@/content/landing'
import { SectionIntro } from '../ui'

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionIntro id="faq-title" align="left" label={faq.label} title={faq.title} />
      </div>
      <div className="space-y-3">
        {faq.items.map((item, i) => (
          // Same `name` makes the native accordion exclusive: opening one closes the rest.
          <details key={item.q} name="faq" open={i === 0} className="card group px-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium">
              {item.q}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist transition group-open:rotate-45 group-open:bg-brand group-open:text-white">
                <Plus aria-hidden className="size-4" />
              </span>
            </summary>
            <p className="-mt-1 pb-6 text-[15px] leading-relaxed text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
