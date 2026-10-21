import { Camera, Check, Mic, Plus, Truck } from 'lucide-react'
import { hero, links } from '@/content/landing'
import { Lines, PrimaryButton, SecondaryButton } from '../ui'
import { Avatar, Bubble, ChatHeader, GroupAvatar, ListPhoto, Phone, type Person } from './chat'

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="haze absolute inset-x-[-15%] top-[30%] h-[75%]" />

      <div className="relative mx-auto max-w-6xl px-5 pt-12 text-center sm:px-8 sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 p-1 pr-3.5 text-[13px] text-ink-2 shadow-sm">
          <span className="rounded-full bg-mist px-2.5 py-0.5 font-medium text-ink">{hero.badge.tag}</span>
          {hero.badge.text}
        </p>

        <h1
          id="hero-title"
          className="mt-7 font-display text-[clamp(2.8rem,7.2vw,5.75rem)] leading-[0.98] font-medium tracking-[-0.045em]"
        >
          <Lines text={hero.title} />
        </h1>

        <p className="mx-auto mt-7 max-w-[640px] text-[17px] leading-relaxed text-pretty text-ink-2 sm:text-lg">{hero.body}</p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <PrimaryButton href={links.signup}>{hero.primary}</PrimaryButton>
          <SecondaryButton href="#how-it-works">{hero.secondary}</SecondaryButton>
        </div>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-ink-3">
          {hero.notes.map((note) => (
            <li key={note} className="inline-flex items-center gap-1.5">
              <Check aria-hidden className="size-4 text-brand" strokeWidth={2.25} />
              {note}
            </li>
          ))}
        </ul>
      </div>

      <HeroVisual />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-linear-to-t from-canvas via-canvas/85 to-transparent" />
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-14 h-[560px] max-w-6xl px-5 sm:mt-16 sm:h-[600px] sm:px-8">
      <Phone time="11:32" className="mx-auto h-[640px] w-[300px] sm:w-[312px]">
        <ChatHeader title="Sharma Family" subtitle="Mom, Papa, Riya, Vani" avatar={<GroupAvatar members={['mom', 'papa', 'riya']} />} />
        <div className="flex flex-1 flex-col gap-2.5 px-3 py-3 text-left">
          <p className="mx-auto rounded-full bg-white px-2.5 py-0.5 text-[10px] text-ink-3 shadow-sm">Today</p>
          <Bubble from="mom" mine time="11:32">
            <ListPhoto className="mb-2 w-[176px]" />
            Vani, need these by evening
          </Bubble>
          <Bubble from="vani" showName time="11:32">
            On it, Mom! I&apos;ve sent you the cart privately to check.
          </Bubble>
          <Bubble from="papa" showName time="11:40">
            Vani, my BP tablets are almost finished
          </Bubble>
          <Bubble from="vani" showName time="11:40">
            I&apos;ll sort it out, Papa. Sending you the details privately.
          </Bubble>
        </div>
        <div aria-hidden className="flex items-center gap-2 border-t border-line bg-white px-3 pt-2.5 pb-6 text-ink-3">
          <Plus className="size-5" />
          <span className="flex-1 rounded-full border border-line px-3 py-1.5 text-left text-[13px]">Message</span>
          <Camera className="size-5" />
          <Mic className="size-5" />
        </div>
      </Phone>

      <FloatCard who="vani" label="Private chat with Mom" className="left-[1%] top-[56px]" delay="0s">
        Cart ready: 7 items, ₹684. Arrives today, 5–6 PM.
        <Actions yes="Confirm" no="Edit" />
      </FloatCard>
      <FloatCard who="vani" label="Private chat with Papa" className="left-[6%] top-[300px]" delay="-2.5s">
        Your Telma 40 runs out on Friday. Shall I reorder the usual strip?
        <Actions yes="Yes, please" no="Not now" />
      </FloatCard>
      <FloatCard who="riya" label="Riya's digest · 8:30 AM in Toronto" className="right-[1%] top-[36px]" delay="-1.2s">
        <ul className="space-y-1.5">
          {['Groceries delivered · ₹684', "Papa's Telma 40 reordered"].map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {line}
            </li>
          ))}
          <li className="pl-6 text-ink-3">Nothing urgent today</li>
        </ul>
      </FloatCard>
      <div
        aria-hidden
        className="absolute right-[10%] top-[318px] hidden animate-float items-center gap-2.5 rounded-full border border-white/80 bg-white/85 py-2 pr-4 pl-2 text-[13px] font-medium shadow-[0_20px_50px_-20px_rgb(64_44_160/0.35)] backdrop-blur-xl lg:flex"
        style={{ animationDelay: '-4s' }}
      >
        <span className="grid size-7 place-items-center rounded-full bg-lilac text-brand">
          <Truck className="size-4" />
        </span>
        Groceries delivered at 5:42 PM
      </div>

    </div>
  )
}

function FloatCard({
  who,
  label,
  className,
  delay,
  children,
}: {
  who: Person
  label: string
  className: string
  delay: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden
      style={{ animationDelay: delay }}
      className={`absolute hidden w-[270px] animate-float rounded-[22px] border border-white/80 bg-white/80 p-3.5 text-left shadow-[0_24px_60px_-24px_rgb(64_44_160/0.4)] backdrop-blur-xl lg:block ${className}`}
    >
      <p className="flex items-center gap-2 text-[11px] font-medium text-ink-3">
        <Avatar who={who} className="size-5 text-[9px]" />
        {label}
      </p>
      <div className="mt-2 text-[13.5px] leading-snug text-ink">{children}</div>
    </div>
  )
}

function Actions({ yes, no }: { yes: string; no: string }) {
  return (
    <span className="mt-2.5 flex gap-1.5 text-[12px] font-medium">
      <span className="rounded-full bg-brand px-3 py-1 text-white">{yes}</span>
      <span className="rounded-full bg-mist px-3 py-1 text-ink-2">{no}</span>
    </span>
  )
}
