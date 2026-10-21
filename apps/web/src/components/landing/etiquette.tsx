import { Check, Moon } from 'lucide-react'
import { etiquette } from '@/content/landing'
import { SectionIntro } from '../ui'
import { Avatar, Bubble, ChatHeader, GroupAvatar } from './chat'

export function Etiquette() {
  return (
    <section aria-labelledby="etiquette-title" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionIntro id="etiquette-title" label={etiquette.label} title={etiquette.title} body={etiquette.body} />
      <div className="mt-16 grid gap-5 lg:grid-cols-2">
        <Pane
          title={etiquette.group.title}
          points={etiquette.group.points}
          chat={
            <>
              <ChatHeader title="Sharma Family" subtitle="Mom, Papa, Riya, Vani" avatar={<GroupAvatar members={['mom', 'papa', 'riya']} />} />
              <div className="space-y-2.5 p-4">
                <Bubble from="papa" showName>
                  Dr. Rao&apos;s appointment is on Thursday at 11
                </Bubble>
                <Bubble from="vani" showName>
                  Noted! I&apos;ll send Papa a short checklist before Thursday.
                </Bubble>
                <Bubble from="mom" showName>
                  Riya, call us this weekend? We miss you
                </Bubble>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-ink-3">
                  <Moon className="size-3" /> Vani stays out of this one
                </p>
              </div>
            </>
          }
        />
        <Pane
          title={etiquette.private.title}
          points={etiquette.private.points}
          chat={
            <>
              <ChatHeader title="Vani" subtitle="Private chat with Papa" avatar={<Avatar who="vani" className="size-7" />} />
              <div className="space-y-2.5 p-4">
                <Bubble from="vani">
                  For Thursday with Dr. Rao: carry your last two sugar reports and your medicine list. Shall I add a question
                  about your knee pain?
                </Bubble>
                <Bubble from="papa" mine>
                  Yes, please add it
                </Bubble>
                <Bubble from="vani">Added. I&apos;ll remind you on Wednesday evening.</Bubble>
              </div>
            </>
          }
        />
      </div>
    </section>
  )
}

function Pane({ title, points, chat }: { title: string; points: string[]; chat: React.ReactNode }) {
  return (
    <article className="card reveal flex flex-col p-6 sm:p-7">
      <h3 className="font-display text-[23px] font-medium tracking-[-0.025em]">{title}</h3>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[15px] text-ink-2">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lilac text-brand">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {p}
          </li>
        ))}
      </ul>
      <div aria-hidden className="well mt-7 flex flex-1 items-center overflow-hidden">
        <div className="m-4 w-full overflow-hidden rounded-2xl border border-line bg-[#f7f6fc] shadow-[0_10px_30px_-14px_rgb(64_44_160/0.3)] sm:m-6">
          {chat}
        </div>
      </div>
    </article>
  )
}
