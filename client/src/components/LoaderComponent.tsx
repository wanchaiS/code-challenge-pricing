export function LoaderComponent() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 shadow-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-600">
          Loading…
        </span>
      </div>
    </div>
  )
}
