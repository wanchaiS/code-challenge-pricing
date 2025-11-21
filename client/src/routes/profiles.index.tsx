import { createProfile, fetchProfiles } from '@/lib/api'
import { SelectionType } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Fragment, useMemo, useState } from 'react'

export const Route = createFileRoute('/profiles/')({
  component: ProfilesPage,
})

function ProfilesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.MULTIPLE,
  )
  const queryClient = useQueryClient()

  const profilesQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  const createMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setProfileName('')
      setSelectionType(SelectionType.MULTIPLE)
      setShowAddForm(false)
    },
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!profileName.trim()) return
    await createMutation.mutateAsync({
      name: profileName.trim(),
      selectionType,
    })
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
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="rounded-full cursor-pointer bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
        >
          {showAddForm ? 'Close' : 'New Pricing Profile'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Create a basic pricing profile
          </h3>

          <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_1px_1fr]">
            <div className="space-y-6 rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div>
                <p className="text-xs tracking-wide text-slate-500">
                  You are creating a Pricing Profile for
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                  {(['one', 'multiple', 'all'] as SelectionType[]).map(
                    (type, idx) => (
                      <Fragment key={type}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            className="sr-only"
                            name="selection-type"
                            value={type}
                            checked={selectionType === type}
                            onChange={() => setSelectionType(type)}
                          />
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              selectionType === type
                                ? 'border-emerald-600'
                                : 'border-slate-300'
                            }`}
                          >
                            {selectionType === type && (
                              <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            )}
                          </span>
                          {type === SelectionType.ONE && 'One Product'}
                          {type === SelectionType.MULTIPLE &&
                            'Multiple Products'}
                          {type === SelectionType.ALL && 'All Products'}
                        </label>
                        {idx < 2 && (
                          <span
                            className="hidden h-4 w-px bg-slate-200 sm:inline-block"
                            aria-hidden="true"
                          />
                        )}
                      </Fragment>
                    ),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="profile-name"
                  className="text-xs tracking-wide text-slate-500"
                >
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Hospitality Partners Q1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="hidden h-full w-px bg-slate-100 lg:block" />
            <div className="flex items-end justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 disabled:opacity-60 lg:w-auto"
              >
                {createMutation.isPending ? 'Saving...' : 'Create profile'}
              </button>
            </div>
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
