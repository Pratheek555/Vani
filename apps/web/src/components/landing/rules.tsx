import { Check } from 'lucide-react'
import { rules } from '@/content/landing'
import { Orb, SectionIntro } from '../ui'

// Laid out like the reference's pricing row: two modes either side of the highlighted policy card.
export function Rules() {
  const { policy } = rules
  return (
    <section aria-labelledby="rules-title" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionIntro id="rules-title" label={rules.label} title={rules.title} body={rules.body} />
      <div className="mt-16 grid gap-5 lg:grid-cols-3">
        <ModeCard {...rules.prepare} />

        <article className="rays reveal flex flex-col overflow-hidden rounded-[28px] p-7 text-white shadow-[0_30px_60px_-24px_rgb(106_71_254/0.65)]">
          <Tag light>{policy.tag}</Tag>
          <h3 className="mt-4 font-display text-[30px] font-medium tracking-[-0.03em] text-balance">{policy.title}</h3>
          <p className="mt-5 font-display text-[46px] leading-none font-medium tracking-[-0.03em]">{policy.amount}</p>
          <p className="mt-2 text-[14px] text-white/75">{policy.amountCaption}</p>
          <div className="my-6 h-px bg-white/20" />
          <Points points={policy.points} light />
          <div aria-hidden className="mt-auto space-y-2 pt-8 text-[13px] leading-snug">
            <p className="ml-auto w-fit max-w-[85%] rounded-[18px] rounded-br-md bg-white px-3 py-2 text-brand-deep">{policy.ask}</p>
            <p className="w-fit max-w-[90%] rounded-[18px] rounded-bl-md bg-white/15 px-3 py-2">{policy.reply}</p>
          </div>
        </article>

        <ModeCard {...rules.autonomous} />
      </div>
    </section>
  )
}

function ModeCard({
  tag,
  title,
  body,
  points,
  note,
  example,
}: {
  tag: string
  title: string
  body: string
  points: string[]
  note: string
  example: { text: string; action: string }
}) {
  return (
    <article className="card reveal flex flex-col p-7">
      <Tag>{tag}</Tag>
      <h3 className="mt-4 font-display text-[30px] font-medium tracking-[-0.03em] text-balance">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{body}</p>
      <div className="my-6 h-px bg-line" />
      <Points points={points} />
      <p className="mt-5 text-[13px] text-ink-3">{note}</p>
      <div aria-hidden className="mt-auto pt-8">
        <div className="flex items-end gap-1.5">
          <Orb className="size-6" />
          <div className="max-w-[88%] rounded-[18px] rounded-bl-md bg-linear-to-br from-[#f1edff] to-[#e6dfff] px-3 py-2 text-[13px] leading-snug">
            {example.text}
            <span className="mt-2 block w-fit rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-brand shadow-sm">
              {example.action}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function Tag({ light = false, children }: { light?: boolean; children: React.ReactNode }) {
  return (
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-[12px] font-medium ${light ? 'bg-white/15 text-white' : 'bg-mist text-ink-2'}`}>
      {children}
    </span>
  )
}

function Points({ points, light = false }: { points: string[]; light?: boolean }) {
  return (
    <ul className="space-y-3">
      {points.map((p) => (
        <li key={p} className={`flex items-start gap-3 text-[15px] ${light ? 'text-white/90' : 'text-ink-2'}`}>
          <span
            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] ${light ? 'border-white/70' : 'border-brand-soft text-brand'}`}
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
          {p}
        </li>
      ))}
    </ul>
  )
}
