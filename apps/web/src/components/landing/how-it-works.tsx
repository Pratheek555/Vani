'use client'

import { useRef, useState } from 'react'
import { Check, Link2, MessageCircle, SlidersHorizontal, Users } from 'lucide-react'
import { steps } from '@/content/landing'
import { SectionIntro } from '../ui'
import { Avatar, Bubble, ChatHeader, GroupAvatar, type Person } from './chat'

const icons = [Users, Link2, MessageCircle, SlidersHorizontal]
const panel = 'rounded-2xl bg-white p-5 text-[13px] shadow-[0_10px_30px_-14px_rgb(64_44_160/0.3)]'

export function HowItWorks() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Vertical tablist: arrow keys move between steps.
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (i + step + steps.items.length) % steps.items.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionIntro id="how-it-works-title" label={steps.label} title={steps.title} />
      <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div role="tablist" aria-orientation="vertical" aria-label="Setup steps" className="space-y-2">
          {steps.items.map((s, i) => {
            const Icon = icons[i] ?? Users
            const selected = i === active
            return (
              <button
                key={s.title}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`step-tab-${i}`}
                aria-selected={selected}
                aria-controls="step-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`flex w-full cursor-pointer gap-4 rounded-[24px] border p-5 text-left transition ${selected ? 'card' : 'border-transparent hover:bg-white/70'}`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${selected ? 'bg-brand text-white' : 'bg-lilac text-brand'}`}
                >
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="flex items-baseline gap-2 font-display text-[19px] font-medium tracking-[-0.02em]">
                    <span className="text-[14px] text-ink-3 tabular-nums">0{i + 1}</span>
                    {s.title}
                  </span>
                  <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-2">{s.body}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id="step-panel"
          aria-labelledby={`step-tab-${active}`}
          className="well flex min-h-[480px] items-center justify-center p-5 sm:p-10"
        >
          <div key={active} aria-hidden className="w-full max-w-[380px] animate-fade-in">
            {[<CreateFamily key={0} />, <Links key={1} />, <GroupHello key={2} />, <Rules key={3} />][active]}
          </div>
        </div>
      </div>
    </section>
  )
}

function CreateFamily() {
  const people: [Person, string, string, string][] = [
    ['riya', 'Riya', 'You', 'America/Toronto'],
    ['mom', 'Mom', 'Parent', 'Asia/Kolkata'],
    ['papa', 'Papa', 'Parent', 'Asia/Kolkata'],
  ]
  return (
    <div className={panel}>
      <p className="text-[16px] font-semibold">Set up Vani</p>
      <p className="mt-0.5 text-[12px] text-ink-3">Add yourself and your parents.</p>
      <p className="mt-4 text-[11px] font-medium text-ink-3">Family name</p>
      <p className="mt-1 rounded-xl border border-line px-3 py-2">Sharma</p>
      <div className="mt-3 space-y-2">
        {people.map(([who, name, role, tz]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
            <Avatar who={who} className="size-7 text-[11px]" />
            <span className="flex-1">
              <span className="block font-medium">{name}</span>
              <span className="text-[11px] text-ink-3">{role}</span>
            </span>
            <span className="text-[11px] text-ink-3">{tz}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-full bg-brand py-2.5 text-center font-medium text-white">Create family</p>
    </div>
  )
}

function Links() {
  const people: [Person, string, boolean][] = [
    ['riya', 'Riya (you)', true],
    ['mom', 'Mom', true],
    ['papa', 'Papa', false],
  ]
  return (
    <div className={panel}>
      <p className="text-[16px] font-semibold">Personal links</p>
      <p className="mt-0.5 text-[12px] text-ink-3">Send each person their own link. One tap connects them.</p>
      <div className="mt-4 space-y-2">
        {people.map(([who, name, linked]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
            <Avatar who={who} className="size-7 text-[11px]" />
            <span className="flex-1 font-medium">{name}</span>
            {linked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <Check className="size-3" strokeWidth={3} /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500" /> Link sent
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-mist py-2.5 font-medium text-ink-2">
        <Link2 className="size-4" /> Copy Papa&apos;s link
      </p>
    </div>
  )
}

function GroupHello() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#f7f6fc] shadow-[0_10px_30px_-14px_rgb(64_44_160/0.3)]">
      <ChatHeader title="Sharma Family" subtitle="Mom, Papa, Riya, Vani" avatar={<GroupAvatar members={['mom', 'papa', 'riya']} />} />
      <div className="space-y-2.5 p-4">
        <p className="mx-auto w-fit rounded-full bg-white px-2.5 py-0.5 text-[11px] text-ink-3 shadow-sm">Riya added Vani</p>
        <Bubble from="vani" showName>
          Hi Mom, Papa and Riya! I&apos;m Vani. I help with groceries, medicines and doctor visits, and I&apos;ll keep my
          messages here short. What&apos;s the pincode at home?
        </Bubble>
        <Bubble from="mom" showName>
          411038
        </Bubble>
        <Bubble from="vani" showName>
          Thanks, Mom! I&apos;ll message you and Papa privately to get set up, a little at a time.
        </Bubble>
      </div>
    </div>
  )
}

function Rules() {
  const rows = [
    ['Groceries', 'Mom approves', 'Auto under ₹2,000'],
    ['Medicines', 'Riya approves', 'Prescription on file'],
    ['Everything else', 'Riya approves', 'Always ask'],
  ]
  return (
    <div className={panel}>
      <p className="text-[16px] font-semibold">Approval rules</p>
      <p className="mt-0.5 text-[12px] text-ink-3">Change any of this later, just by asking Vani.</p>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line">
        {rows.map(([what, who, limit]) => (
          <div key={what} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span>
              <span className="block font-medium">{what}</span>
              <span className="text-[11px] text-ink-3">{who}</span>
            </span>
            <span className="rounded-full bg-lilac px-2 py-0.5 text-[11px] font-medium text-brand">{limit}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between rounded-xl bg-mist px-3 py-2.5">
        <span className="text-ink-2">Monthly cap</span>
        <span className="font-semibold">₹10,000</span>
      </div>
      <div className="mt-2 flex justify-between rounded-xl bg-mist px-3 py-2.5">
        <span className="text-ink-2">FYIs go to</span>
        <span className="font-semibold">Riya</span>
      </div>
    </div>
  )
}
