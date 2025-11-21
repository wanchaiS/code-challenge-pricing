import { useRouter } from '@tanstack/react-router'

export function NotFound() {
  const router = useRouter()
  const goToProfiles = () => router.navigate({ to: '/profiles' })
  const goHome = () => router.navigate({ to: '/' })

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Not Found</h2>
        <p className="text-sm text-slate-500">
          We couldn’t find that page. You can return to your pricing profiles or
          go back to the dashboard.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goToProfiles}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            View Profiles
          </button>
          <button
            type="button"
            onClick={goHome}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
