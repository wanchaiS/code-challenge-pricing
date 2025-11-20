import { Bell, HelpCircle } from 'lucide-react'
import type { PropsWithChildren } from 'react'

const mockUser = {
  name: 'Ekemini Mark',
  email: 'supplier@foboh.com',
  organization: 'Heaps Normal',
}

const today = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export function Layout({ children }: PropsWithChildren) {
  const initials = mockUser.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 shadow-lg shadow-emerald-900/10">
        <div className="border-b border-emerald-500/30 bg-emerald-600 px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between py-5 text-white">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Hello, {mockUser.name.split(' ')[0]}
              </p>
              <p className="text-xs text-emerald-100">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-white/30 p-2 text-white transition hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/30 p-2 text-white transition hover:bg-white/10"
                aria-label="Help"
              >
                <HelpCircle size={18} />
              </button>
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium leading-tight">
                    {mockUser.name}
                  </p>
                  <p className="text-xs text-emerald-100">
                    {mockUser.organization}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-emerald-700">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
