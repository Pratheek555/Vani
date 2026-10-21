import { Image as ImageIcon, MessageCircle, PhoneMissed } from 'lucide-react'
import { problem } from '@/content/landing'
import { Label, Lines } from '../ui'

// What lands on the student's phone at night without Vani. "Beta" is how Indian parents say "kiddo".
const notifications = [
  { from: 'Mom', text: 'Beta, my BP tablets are finished. Can you order?', when: 'now', icon: MessageCircle },
  { from: 'Papa', text: 'The grocery app is asking for some OTP. What to do??', when: '6m ago', icon: MessageCircle },
  { from: 'Mom', text: 'Photo: Report came today. Is everything okay?', when: '14m ago', icon: ImageIcon },
  { from: 'Mom', text: 'Missed voice call (2)', when: '21m ago', icon: PhoneMissed },
]

const stars =
  'radial-gradient(1.5px 1.5px at 12% 18%, #fff9, transparent), radial-gradient(1px 1px at 28% 8%, #fff8, transparent), radial-gradient(1.5px 1.5px at 74% 12%, #fffa, transparent), radial-gradient(1px 1px at 88% 30%, #fff7, transparent), radial-gradient(1px 1px at 60% 22%, #fff6, transparent), radial-gradient(1.5px 1.5px at 40% 30%, #fff5, transparent)'

export function Problem() {
  return (
    <section
      aria-labelledby="problem-title"
      className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-20 lg:py-24"
    >
      <div className="reveal max-w-xl">
        <Label>{problem.label}</Label>
        <h2
          id="problem-title"
          className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance"
        >
          <Lines text={problem.title} />
        </h2>
        {problem.body.map((p) => (
          <p key={p} className="mt-5 text-lg leading-relaxed text-pretty text-ink-2">
            {p}
          </p>
        ))}
      </div>

      <div
        aria-hidden
        className="reveal relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[40px] px-5 pt-8 pb-7 text-white shadow-[0_40px_80px_-30px_rgb(23_14_70/0.6)]"
        style={{ background: `${stars}, radial-gradient(120% 75% at 50% 0%, #3b2b80 0%, #191339 55%, #0c0a1c 100%)` }}
      >
        <p className="text-center text-[14px] text-white/70">Wednesday, 21 October</p>
        <p className="text-center font-display text-[88px] leading-none font-medium tracking-[-0.04em]">2:07</p>
        <p className="mt-1 text-center text-[12px] text-white/50">Toronto</p>
        <div className="mt-7 space-y-2.5">
          {notifications.map(({ from, text, when, icon: Icon }) => (
            <div key={text} className="flex gap-3 rounded-[20px] border border-white/10 bg-white/10 p-3 backdrop-blur-md">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex justify-between gap-2 text-[13px]">
                  <span className="font-semibold">{from}</span>
                  <span className="text-white/50">{when}</span>
                </p>
                <p className="text-[13px] leading-snug text-white/80">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
