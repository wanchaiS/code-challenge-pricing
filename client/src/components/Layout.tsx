import { Link } from '@tanstack/react-router'
import {
  Bell,
  ClipboardList,
  HelpCircle,
  Package,
  type LucideIcon,
} from 'lucide-react'
import type { PropsWithChildren } from 'react'

const mockUser = {
  name: 'Peter Wanchai',
  email: 'supplier@foboh.com',
  organization: 'UTS Supplies Pty Ltd',
}

const today = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

type NavItem = {
  icon: LucideIcon
  label: string
  to: string
}

const navItems: NavItem[] = [
  {
    icon: ClipboardList,
    label: 'Profiles',
    to: '/profiles',
  },
  {
    icon: Package,
    label: 'Products',
    to: '/products',
  },
]

export function Layout({ children }: PropsWithChildren) {
  const initials = mockUser.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:flex md:w-64 md:flex-col md:border-b-0 md:border-r md:px-6 md:py-8">
          <div className="flex items-center justify-between md:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                Pricing
              </p>
              <p className="text-base font-semibold text-slate-900">
                Command Center
              </p>
            </div>
            <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-semibold uppercase text-white md:hidden">
              {initials}
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:mt-10 md:flex-col md:space-y-2 md:overflow-visible">
            {navItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                preload="intent"
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    'group flex min-w-[160px] items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition',
                }}
                inactiveProps={{
                  className:
                    'group flex min-w-[160px] items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:border-emerald-200 focus-visible:bg-white',
                }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-8 w-1 rounded-full transition-colors ${
                        isActive
                          ? 'bg-emerald-600'
                          : 'bg-transparent group-hover:bg-emerald-200'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`rounded-2xl border px-2.5 py-2 transition-colors ${
                        isActive
                          ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <span className="whitespace-nowrap">{label}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 shadow-lg shadow-emerald-900/10">
            <div className="border-b border-emerald-500/30 bg-emerald-600 px-4 sm:px-6">
              <div className="mx-auto flex max-w-6xl items-center justify-between py-5 text-white">
                <div className="space-y-1">
                  <Link to="/profiles" className="hover:underline">
                    <p className="text-sm font-semibold">
                      Hello, {mockUser.name.split(' ')[0]}
                    </p>
                  </Link>

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
                  <div className="hidden items-center gap-3 rounded-full bg-white/10 px-4 py-2 md:flex">
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

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
