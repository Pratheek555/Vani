// Small chat-app pieces for the mockups. One family (the Sharmas) runs through the whole page:
// Riya studies in Toronto, Mom and Papa live in Pune, cousin Rahul lives nearby.
import { ChevronLeft } from 'lucide-react'
import { Orb } from '../ui'

export type Person = 'vani' | 'mom' | 'papa' | 'riya' | 'rahul'

const people: Record<Exclude<Person, 'vani'>, { name: string; tint: string; text: string }> = {
  mom: { name: 'Mom', tint: 'bg-[#ffe3cf] text-[#9a4a1c]', text: 'text-[#b4561f]' },
  papa: { name: 'Papa', tint: 'bg-[#d5f1e1] text-[#1f6b47]', text: 'text-[#23804f]' },
  riya: { name: 'Riya', tint: 'bg-[#dde6ff] text-[#2c4aa8]', text: 'text-[#3550b8]' },
  rahul: { name: 'Rahul', tint: 'bg-[#fde3f1] text-[#9b2c6c]', text: 'text-[#a8327a]' },
}

export function Avatar({ who, className = 'size-7 text-xs' }: { who: Person; className?: string }) {
  if (who === 'vani') return <Orb className={className} />
  const p = people[who]
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full font-semibold ${p.tint} ${className}`}>
      {p.name[0]}
    </span>
  )
}

export function Bubble({
  from,
  mine = false,
  showName = false,
  time,
  tone,
  className = '',
  children,
}: {
  from: Person
  mine?: boolean
  showName?: boolean
  time?: string
  tone?: 'alert'
  className?: string
  children: React.ReactNode
}) {
  const name = from === 'vani' ? 'Vani' : people[from].name
  const look = mine
    ? 'rounded-br-md bg-brand text-white'
    : tone === 'alert'
      ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-ink'
      : from === 'vani'
        ? 'rounded-bl-md bg-linear-to-br from-[#f1edff] to-[#e6dfff] text-ink'
        : 'rounded-bl-md border border-line bg-white text-ink'

  return (
    <div className={`flex items-end gap-1.5 ${mine ? 'justify-end' : ''} ${className}`}>
      {!mine && <Avatar who={from} className="size-6 text-[10px]" />}
      <div className={`max-w-[82%] rounded-[18px] px-3 py-2 text-[13px] leading-snug ${look}`}>
        {showName && !mine && (
          <p className={`mb-0.5 text-[11px] font-semibold ${from === 'vani' ? 'text-brand' : people[from].text}`}>{name}</p>
        )}
        {children}
        {time && <span className={`ml-2 float-right mt-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-ink-3'}`}>{time}</span>}
      </div>
    </div>
  )
}

/** A chat app's top bar: back arrow, avatar, title and who's in it. */
export function ChatHeader({ title, subtitle, avatar }: { title: string; subtitle: string; avatar: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line/80 bg-white/85 px-3 py-2.5 backdrop-blur">
      <ChevronLeft aria-hidden className="size-5 text-brand" />
      {avatar}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[14px] font-semibold">{title}</p>
        <p className="truncate text-[11px] text-ink-3">{subtitle}</p>
      </div>
    </div>
  )
}

/** Overlapping initials for a group chat avatar. */
export function GroupAvatar({ members }: { members: Person[] }) {
  return (
    <span aria-hidden className="flex -space-x-2">
      {members.map((m) => (
        <Avatar key={m} who={m} className="size-7 text-[11px] ring-2 ring-white" />
      ))}
    </span>
  )
}

export function Phone({ time, className = '', children }: { time: string; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative rounded-[54px] bg-[#111016] p-[11px] shadow-[0_50px_100px_-30px_rgb(46_30_120/0.45),0_0_0_1px_rgb(255_255_255/0.08)_inset] ${className}`}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[44px] bg-[#f6f5fb]">
        <div className="absolute left-1/2 top-2.5 z-20 h-[27px] w-[94px] -translate-x-1/2 rounded-full bg-black" />
        <div className="flex items-center justify-between px-7 pt-3.5 pb-1.5 text-[13px] font-semibold">
          <span>{time}</span>
          <span aria-hidden className="flex items-center gap-1">
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-[11px] w-[22px] rounded-[4px] border border-ink/40 p-[1.5px]">
              <span className="block h-full w-[70%] rounded-[2px] bg-ink" />
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

/** A photo of Mom's handwritten grocery list. */
export function ListPhoto({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`overflow-hidden rounded-xl bg-[#d8c4a6] p-2.5 ${className}`}>
      <div className="-rotate-3 rounded-sm bg-[#fffaf0] px-3 py-2 font-hand text-[17px] leading-[1.15] text-[#2b2a4a] shadow-[0_6px_14px_-6px_rgb(60_40_10/0.5)]">
        {['Milk 2 L', 'Atta 5 kg', 'Tomatoes 1 kg', 'Onions', 'Dhania', 'Curd', 'Bread'].map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  )
}
