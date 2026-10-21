import { ArrowRight, BellRing, CalendarCheck, Check, FileText, Pill, ShieldCheck, ShoppingBasket } from 'lucide-react'
import { features } from '@/content/landing'
import { Orb, SectionIntro } from '../ui'
import { Avatar, Bubble, ListPhoto } from './chat'

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionIntro id="features-title" label={features.label} title={features.title} body={features.body} />
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard {...features.groceries} wide className="md:col-span-2">
          <Groceries />
        </FeatureCard>
        <FeatureCard {...features.refills}>
          <Refills />
        </FeatureCard>
        <FeatureCard {...features.reports}>
          <Reports />
        </FeatureCard>
        <FeatureCard {...features.visits}>
          <Visit />
        </FeatureCard>
        <FeatureCard {...features.redFlags} well="bg-linear-to-br from-rose-50 to-[#fff6f0] border-rose-100">
          <RedFlag />
        </FeatureCard>
        <FeatureCard {...features.vault}>
          <Vault />
        </FeatureCard>
        <FeatureCard {...features.digest} wide className="lg:col-span-2">
          <Digest />
        </FeatureCard>
      </div>
    </section>
  )
}

function FeatureCard({
  title,
  body,
  wide = false,
  well = 'well',
  className = '',
  children,
}: {
  title: string
  body: string
  wide?: boolean
  well?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <article className={`card reveal flex flex-col p-6 sm:p-7 ${className}`}>
      <div className={wide ? 'max-w-lg' : ''}>
        <h3 className="font-display text-[23px] leading-tight font-medium tracking-[-0.025em]">{title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{body}</p>
      </div>
      <div
        aria-hidden
        className={`mt-6 flex min-h-[220px] flex-1 items-center justify-center rounded-[22px] border p-5 ${well === 'well' ? 'well' : well}`}
      >
        {children}
      </div>
    </article>
  )
}

const panel = 'rounded-2xl bg-white p-4 text-[13px] shadow-[0_10px_30px_-14px_rgb(64_44_160/0.3)]'

function Groceries() {
  const items = [
    ['Toned milk 1 L × 2', '₹112'],
    ['Atta 5 kg', '₹299'],
    ['Tomatoes 1 kg', '₹44'],
    ['Onions 1 kg', '₹48'],
  ]
  return (
    <div className="flex w-full items-center justify-center gap-4">
      <ListPhoto className="hidden w-[150px] shrink-0 -rotate-3 shadow-lg sm:block" />
      <ArrowRight className="hidden size-5 shrink-0 text-brand sm:block" />
      <div className={`${panel} w-full max-w-[250px]`}>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Cart ready</p>
          <span className="rounded-full bg-lilac px-2 py-0.5 text-[11px] font-medium text-brand">7 items</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-ink-2">
          {items.map(([item, price]) => (
            <li key={item} className="flex justify-between gap-3">
              <span>{item}</span>
              <span className="text-ink tabular-nums">{price}</span>
            </li>
          ))}
          <li className="text-ink-3">+ 3 more</li>
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-ink-3">Total</span>
          <span className="text-[17px] font-semibold">₹684</span>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-3">Arrives today, 5–6 PM</p>
        <div className="mt-3 flex gap-1.5 text-center text-[12px] font-medium">
          <span className="flex-1 rounded-full bg-brand py-1.5 text-white">Confirm</span>
          <span className="flex-1 rounded-full bg-mist py-1.5 text-ink-2">Edit</span>
        </div>
      </div>
    </div>
  )
}

function Refills() {
  return (
    <div className="w-full max-w-[270px] space-y-3">
      <div className={panel}>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-lilac text-brand">
            <Pill className="size-5" />
          </span>
          <div>
            <p className="text-[14px] font-semibold">Telma 40</p>
            <p className="text-[12px] text-ink-3">Papa · 1 tablet a day</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-mist">
          <div className="h-full w-[20%] rounded-full bg-amber-400" />
        </div>
        <p className="mt-2 flex justify-between text-[12px]">
          <span className="text-ink-3">6 of 30 left</span>
          <span className="font-medium text-amber-700">Runs out Friday</span>
        </p>
      </div>
      <Bubble from="vani">Papa, your Telma 40 runs out on Friday. Shall I reorder?</Bubble>
    </div>
  )
}

function Reports() {
  const rows = [
    { name: 'Haemoglobin', value: '11.8 g/dL', flag: 'Slightly low', tone: 'bg-amber-50 text-amber-700' },
    { name: 'Vitamin D', value: '18 ng/mL', flag: 'Low', tone: 'bg-amber-50 text-amber-700' },
    { name: 'TSH', value: '2.1 mIU/L', flag: 'Normal', tone: 'bg-emerald-50 text-emerald-700' },
  ]
  return (
    <div className={`${panel} w-full max-w-[280px]`}>
      <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
        <FileText className="size-3.5" /> Mom · Blood test, 14 Oct
      </p>
      <ul className="mt-2 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between py-2">
            <span>
              <span className="block font-medium">{r.name}</span>
              <span className="text-[12px] text-ink-3">{r.value}</span>
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${r.tone}`}>{r.flag}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 rounded-xl bg-lilac/70 p-2.5 text-[12px] leading-snug text-ink-2">
        Both are common. Worth mentioning to your doctor, so I&apos;ve added them to your questions.
      </p>
    </div>
  )
}

function Visit() {
  const items: [string, boolean][] = [
    ['Last two sugar reports', true],
    ['Current medicine list', true],
    ['Ask about the knee pain on stairs', false],
  ]
  return (
    <div className={`${panel} w-full max-w-[270px]`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-lilac text-brand">
          <CalendarCheck className="size-5" />
        </span>
        <div>
          <p className="text-[14px] font-semibold">Dr. Rao</p>
          <p className="text-[12px] text-ink-3">Papa · Thursday, 11 AM</p>
        </div>
      </div>
      <p className="mt-4 text-[11px] font-medium tracking-wide text-ink-3 uppercase">Before the visit</p>
      <ul className="mt-2 space-y-2">
        {items.map(([item, done]) => (
          <li key={item} className="flex items-center gap-2.5">
            <span
              className={`grid size-[18px] shrink-0 place-items-center rounded-full ${done ? 'bg-brand text-white' : 'border-[1.5px] border-ink/20'}`}
            >
              {done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={done ? 'text-ink-3 line-through decoration-ink/20' : ''}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RedFlag() {
  return (
    <div className="w-full max-w-[280px] space-y-2.5">
      <Bubble from="papa">Feeling dizzy and some pain in my chest</Bubble>
      <Bubble from="vani" tone="alert">
        Papa, please call <b>108</b> now or go to the nearest hospital. I&apos;m alerting Riya and Rahul.
      </Bubble>
      <div className="flex flex-wrap gap-1.5 pl-7">
        {['Riya alerted', 'Rahul (nearby) alerted'].map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-rose-600 shadow-sm">
            <BellRing className="size-3" /> {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function Vault() {
  return (
    <div className="w-full max-w-[280px] space-y-2.5">
      <Bubble from="papa" mine>
        Vani, send my last HbA1c report
      </Bubble>
      <div className="flex items-end gap-1.5">
        <Avatar who="vani" className="size-6" />
        <div className="rounded-[18px] rounded-bl-md border border-line bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-rose-50 text-[10px] font-bold text-rose-500">PDF</span>
            <span>
              <span className="block text-[13px] font-medium">HbA1c report</span>
              <span className="text-[11px] text-ink-3">2 Sep 2026 · Dr. Rao</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {['Prescriptions', 'Lab reports', 'Discharge summaries'].map((t) => (
          <span key={t} className="rounded-full border border-line bg-white/80 px-2.5 py-1 text-[11px] text-ink-2">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function Digest() {
  const items = [
    { icon: ShoppingBasket, title: 'Groceries delivered', detail: '₹684 · Mom confirmed the cart' },
    { icon: Pill, title: 'Telma 40 refill ordered', detail: 'Arrives Thursday' },
    { icon: FileText, title: "Mom's blood test explained", detail: 'Questions added for her next visit' },
    { icon: CalendarCheck, title: 'Dr. Rao on Thursday, 11 AM', detail: 'Checklist sent to Papa' },
  ]
  return (
    <div className="grid w-full max-w-[560px] gap-4 sm:grid-cols-[1.45fr_1fr]">
      <div className={panel}>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold">
            <Orb className="size-5" /> Your daily digest
          </p>
          <span className="text-[11px] text-ink-3">8:30 AM · Toronto</span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {items.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-lilac text-brand">
                <Icon className="size-3.5" />
              </span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="text-[12px] text-ink-3">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <div className={panel}>
          <p className="text-[12px] text-ink-3">Spent this month</p>
          <p className="mt-1 font-display text-[28px] font-medium tracking-tight">₹3,420</p>
          <div className="mt-3 h-2 rounded-full bg-mist">
            <div className="h-full w-[34%] rounded-full bg-brand" />
          </div>
          <p className="mt-2 text-[12px] text-ink-3">of your ₹10,000 monthly cap</p>
        </div>
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-[13px] font-medium text-emerald-700">
          <ShieldCheck className="size-4" /> Nothing urgent today
        </p>
      </div>
    </div>
  )
}
