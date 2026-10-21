import { links, nav } from '@/content/landing'
import { Logo } from '../ui'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" aria-label="Vani, back to top">
          <Logo />
        </a>
        <nav
          aria-label="Main"
          className="hidden items-center gap-1 rounded-full border border-line bg-white/90 p-1 shadow-[0_6px_20px_-12px_rgb(23_22_29/0.2)] md:flex"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[15px] text-ink-2 transition hover:bg-lilac hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={links.login}
            className="rounded-full px-3 py-2.5 text-[15px] font-medium transition hover:text-brand sm:border sm:border-line sm:bg-white sm:px-5 sm:hover:border-ink/15 sm:hover:text-ink"
          >
            Log in
          </a>
          <a
            href={links.signup}
            className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-white transition hover:bg-black"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  )
}
