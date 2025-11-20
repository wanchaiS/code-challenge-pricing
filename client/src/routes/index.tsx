import { createProfile, fetchProfiles } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/')({
  component: ProfilesPage,
})

function ProfilesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()

  const profilesQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  const createMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setNewName('')
      setIsCreating(false)
    },
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await createMutation.mutateAsync(newName.trim())
  }

  const orderedProfiles = useMemo(
    () =>
      [...(profilesQuery.data ?? [])].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [profilesQuery.data],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Pricing Profiles
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Manage your customer pricing
          </h2>
          <p className="text-sm text-slate-500">
            Create a new profile or update an existing one to tailor pricing per
            customer segment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((prev) => !prev)}
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
        >
          {isCreating ? 'Close' : 'New Pricing Profile'}
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Create a basic pricing profile
          </h3>
          <p className="text-sm text-slate-500">
            Give your profile a memorable name. You can add products and rules
            later.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Hospitality Partners Q1"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving...' : 'Create profile'}
            </button>
          </div>
        </form>
      )}

      {profilesQuery.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {profilesQuery.error instanceof Error
            ? profilesQuery.error.message
            : 'Failed to load profiles'}
        </div>
      )}

      {profilesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : (
        <section className="space-y-4">
          {orderedProfiles.map((profile) => (
            <article
              key={profile._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Pricing Profile
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {profile.name}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {profile.selectionType === 'all'
                    ? 'All products'
                    : profile.selectionType === 'multiple'
                      ? 'Multiple products'
                      : 'Single product'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <p>
                  Last updated{' '}
                  {new Date(profile.updatedAt).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <Link
                  to="/profiles/$profileId"
                  params={{ profileId: profile._id }}
                  className="text-sm font-semibold text-emerald-600 underline underline-offset-4 hover:text-emerald-500"
                >
                  Setup &rarr;
                </Link>
              </div>
            </article>
          ))}
          {!orderedProfiles.length && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
              No pricing profiles yet. Click “New Pricing Profile” to get
              started.
            </div>
          )}
        </section>
      )}
    </div>
  )
}
