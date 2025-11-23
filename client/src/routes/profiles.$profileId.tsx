import { SelectionDialog } from '@/components/SelectionDialog'
import {
  fetchProfileDetail,
  fetchProfiles,
  type ProductResponse,
} from '@/lib/api'
import type { AdjustmentType, IncrementType } from '@/lib/types'
import { SelectionType } from '@/lib/types'
import { BasedOnSection } from '@/routes/-profiles/BaseOnSection'
import { ProfileProductsTable } from '@/routes/-profiles/ProfileProductsTable'
import { SearchProducts } from '@/routes/-profiles/SearchProducts'
import { useProfileDraft } from '@/routes/-profiles/useProfileDraft'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type SelectionValue = 'one' | 'multiple' | 'all'

const selectionTypeLabels: Record<SelectionValue, string> = {
  one: 'One Product',
  multiple: 'Multiple Products',
  all: 'All Products',
}

export const Route = createFileRoute('/profiles/$profileId')({
  component: ProfileEditorPage,
})

function ProfileEditorPage() {
  const { profileId } = Route.useParams()
  const router = useRouter()

  const [pendingSelectionType, setPendingSelectionType] =
    useState<SelectionType | null>(null)
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false)

  const detailQuery = useSuspenseQuery({
    queryKey: ['profile-detail', profileId],
    queryFn: () => fetchProfileDetail(profileId),
  })

  const profilesQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    staleTime: 5 * 60 * 1000,
  })

  const {
    draft,
    setDraft,
    previewMap,
    tableItems,
    canPreview,
    hasUnsavedChanges,
    needsPreviewRefresh,
    markPreviewDirty,
    clearPreviewEntries,
    previewProfileDraft,
    saveProfileDraft,
    isPreviewing,
    isSaving,
    saveError,
    previewError,
  } = useProfileDraft(profileId, detailQuery.data)

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [editingCell, setEditingCell] = useState<{
    id: string
    value: string
  } | null>(null)

  // Keep selected rows and editing cell in sync with visible table items
  useEffect(() => {
    const visibleIds = new Set(tableItems.map((item) => item.productId))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedRowIds((prev) => prev.filter((id) => visibleIds.has(id)))
    setEditingCell((prev) =>
      prev &&
      visibleIds.has(prev.id) &&
      draft.selectionType !== SelectionType.ALL
        ? prev
        : null,
    )
  }, [tableItems, draft.selectionType])

  const selectedProductIds = draft.productAdjustments.map(
    (adj) => adj.productId,
  )

  const availableProfiles = useMemo(
    () =>
      (profilesQuery.data ?? []).filter((profile) => profile._id !== profileId),
    [profilesQuery.data, profileId],
  )

  const basedOnProfile = useMemo(
    () => profilesQuery.data?.find((profile) => profile._id === draft.basedOn),
    [profilesQuery.data, draft.basedOn],
  )

  const basedOnSummary = basedOnProfile
    ? `The adjusted price will be calculated from "${basedOnProfile.name}" or global price if product is not found in the base profile.`
    : 'No profile selected — The adjusted price will be calculated from the global price.'

  const requestError = saveError ?? previewError

  const pendingSelectionLabel = pendingSelectionType
    ? selectionTypeLabels[pendingSelectionType as SelectionValue]
    : null

  function handleSelectionChangeRequest(type: SelectionType) {
    if (draft.selectionType === type) return
    setPendingSelectionType(type)
    setSelectionDialogOpen(true)
  }

  function confirmSelectionChange() {
    if (!pendingSelectionType) return
    const targetType = pendingSelectionType
    setSelectionDialogOpen(false)
    setPendingSelectionType(null)

    setDraft((prev) => {
      if (!prev) return prev
      let nextAdjustments = prev.productAdjustments
      if (targetType === 'all') {
        nextAdjustments = []
      } else if (targetType === 'one') {
        nextAdjustments = prev.productAdjustments.slice(0, 1)
      } else if (prev.selectionType === 'all') {
        nextAdjustments = []
      }
      return {
        ...prev,
        selectionType: targetType,
        productAdjustments: nextAdjustments,
        adjustmentValueForAll: targetType === 'all' ? 0 : null,
      }
    })
    if (pendingSelectionType) {
      const removedIds =
        pendingSelectionType === 'one'
          ? selectedProductIds.slice(1)
          : pendingSelectionType === 'all'
            ? selectedProductIds
            : []
      clearPreviewEntries(removedIds)
    }
    setSelectedRowIds([])
    setEditingCell(null)
    markPreviewDirty()
  }

  function cancelSelectionChange() {
    setSelectionDialogOpen(false)
    setPendingSelectionType(null)
  }

  function handleBasedOnChange(profileIdValue: string | null) {
    setDraft((prev) => (prev ? { ...prev, basedOn: profileIdValue } : prev))
    markPreviewDirty()
  }

  function handleRowSelectionToggle(productId: string, checked: boolean) {
    if (draft.selectionType === SelectionType.ALL) return
    setSelectedRowIds((prev) => {
      if (checked) {
        if (prev.includes(productId)) return prev
        return [...prev, productId]
      }
      return prev.filter((id) => id !== productId)
    })
  }

  function handleSelectAllRows(productIds: string[]) {
    if (draft.selectionType === SelectionType.ALL) return
    setSelectedRowIds(productIds)
  }

  function handleClearSelection() {
    setSelectedRowIds([])
  }

  function handleStartEditingCell(productId: string, currentValue: number) {
    if (draft.selectionType === SelectionType.ALL) return
    setEditingCell({ id: productId, value: String(currentValue) })
  }

  function handleEditingValueChange(value: string) {
    setEditingCell((prev) => (prev ? { ...prev, value } : prev))
  }

  function handleCommitEditing() {
    if (!editingCell) return
    handleAdjustmentChange(editingCell.id, Number(editingCell.value))
    setEditingCell(null)
  }

  function handleCancelEditing() {
    setEditingCell(null)
  }

  function handleToggleProductFromSearch(
    product: ProductResponse,
    checked: boolean,
  ) {
    if (draft.selectionType === SelectionType.ALL) return
    const productInfo = mapSummaryProductToDraft(product)

    if (checked) {
      setDraft((prev) => {
        if (!prev) return prev

        // Selecting a product for single-selection profiles should replace the
        // existing entry and keep whatever adjustment value the user already set.
        if (prev.selectionType === SelectionType.ONE) {
          const retainedValue = prev.productAdjustments[0]?.adjustmentValue ?? 0
          return {
            ...prev,
            productAdjustments: [
              {
                productId: product._id,
                adjustmentValue: retainedValue,
                product: productInfo,
              },
            ],
          }
        }

        const adjustmentIndex = prev.productAdjustments.findIndex(
          (adj) => adj.productId === product._id,
        )
        // If the product already exists, update only the stored metadata.
        if (adjustmentIndex !== -1) {
          const next = [...prev.productAdjustments]
          next[adjustmentIndex] = {
            ...next[adjustmentIndex]!,
            product: productInfo,
          }
          return { ...prev, productAdjustments: next }
        }

        // Otherwise add a new adjustment stub with a zero starting value.
        return {
          ...prev,
          productAdjustments: [
            ...prev.productAdjustments,
            {
              productId: product._id,
              adjustmentValue: 0,
              product: productInfo,
            },
          ],
        }
      })
      markPreviewDirty()
      return
    }

    // Removing a product drops the adjustment and clears the preview row.
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            productAdjustments: prev.productAdjustments.filter(
              (adj) => adj.productId !== product._id,
            ),
          }
        : prev,
    )
    setSelectedRowIds((prev) => prev.filter((id) => id !== product._id))
    setEditingCell((prev) => (prev && prev.id === product._id ? null : prev))
    clearPreviewEntries([product._id])
    markPreviewDirty()
  }

  function handleAdjustmentChange(productId: string, value: number) {
    const normalizedValue = Number.isNaN(value) ? 0 : Math.abs(value)
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        productAdjustments: prev.productAdjustments.map((adj) =>
          adj.productId === productId
            ? { ...adj, adjustmentValue: normalizedValue }
            : adj,
        ),
      }
    })
    markPreviewDirty()
  }

  function handleAdjustmentValueForAllChange(value: number | null) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            adjustmentValueForAll:
              value === null || Number.isNaN(value) ? null : Math.abs(value),
          }
        : prev,
    )
    markPreviewDirty()
  }

  function handleAdjustmentTypeChange(type: AdjustmentType) {
    setDraft((prev) => (prev ? { ...prev, adjustmentType: type } : prev))
    markPreviewDirty()
  }

  function handleIncrementTypeChange(type: IncrementType) {
    setDraft((prev) => (prev ? { ...prev, incrementType: type } : prev))
    markPreviewDirty()
  }

  function handleRemoveSelectedProducts(productIds: string[]) {
    if (!productIds.length) return
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            productAdjustments: prev.productAdjustments.filter(
              (adj) => !productIds.includes(adj.productId),
            ),
          }
        : prev,
    )
    clearPreviewEntries(productIds)
    setSelectedRowIds((prev) => prev.filter((id) => !productIds.includes(id)))
    if (editingCell && productIds.includes(editingCell.id)) {
      setEditingCell(null)
    }
    if (productIds.length) {
      markPreviewDirty()
    }
  }

  function handlePreview() {
    if (!canPreview) return
    previewProfileDraft()
  }

  function handleSave() {
    saveProfileDraft()
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav className="text-xs uppercase tracking-wide text-slate-500">
              <Link to="/">Pricing Profiles</Link> / Setup a profile
            </nav>
            <h2 className="text-2xl font-semibold text-slate-900">
              {draft.name}
            </h2>
            <p className="text-sm text-slate-500">
              Setup your pricing profile, select products, and assign customers.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.history.back()}
              className="rounded-full cursor-pointer border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              data-testid="save-draft-button"
              className="relative cursor-pointer rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              aria-live="polite"
            >
              Save as Draft
              {hasUnsavedChanges && (
                <>
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                  <span className="sr-only">Unsaved changes</span>
                </>
              )}
              {isSaving && (
                <LoaderCircle className="ml-2 inline-block h-4 w-4 animate-spin" />
              )}
            </button>
          </div>
        </div>

        {requestError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {saveError ? 'Unable to save draft: ' : 'Unable to preview: '}
            {requestError instanceof Error && requestError.message
              ? requestError.message
              : 'Something went wrong'}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Set Product Pricing
          </h3>
          <p className="text-sm text-slate-500">Set details</p>

          <div className="mt-6 space-y-8">
            <SearchProducts
              selectionType={draft.selectionType}
              onSelectionTypeChange={handleSelectionChangeRequest}
              selectedIds={selectedProductIds}
              onToggleProduct={handleToggleProductFromSearch}
              profileName={draft.name}
            />

            <BasedOnSection
              basedOnValue={draft.basedOn}
              basedOnOptions={availableProfiles}
              summary={basedOnSummary}
              adjustmentType={draft.adjustmentType}
              incrementType={draft.incrementType}
              loadingProfiles={profilesQuery.isLoading}
              onBasedOnChange={handleBasedOnChange}
              onAdjustmentTypeChange={handleAdjustmentTypeChange}
              onIncrementTypeChange={handleIncrementTypeChange}
            />

            <ProfileProductsTable
              selectionType={draft.selectionType}
              adjustmentType={draft.adjustmentType}
              incrementType={draft.incrementType}
              items={tableItems}
              previewMap={previewMap}
              adjustmentValueForAll={draft.adjustmentValueForAll}
              onChangeAdjustmentForAll={handleAdjustmentValueForAllChange}
              onRemoveSelectedProducts={handleRemoveSelectedProducts}
              onRefresh={handlePreview}
              canRefresh={canPreview}
              refreshing={isPreviewing}
              needsRefreshIndicator={needsPreviewRefresh}
              selectedIds={selectedRowIds}
              onToggleSelection={handleRowSelectionToggle}
              onSelectAllRows={handleSelectAllRows}
              onClearSelection={handleClearSelection}
              editingCell={editingCell}
              onStartEditing={handleStartEditingCell}
              onChangeEditingValue={handleEditingValueChange}
              onCommitEditing={handleCommitEditing}
              onCancelEditing={handleCancelEditing}
            />
          </div>
        </section>
      </div>

      <SelectionDialog
        open={selectionDialogOpen}
        pendingLabel={pendingSelectionLabel}
        onConfirm={confirmSelectionChange}
        onCancel={cancelSelectionChange}
      />
    </>
  )
}

function mapSummaryProductToDraft(product: ProductResponse) {
  return {
    _id: product._id,
    title: product.title,
    skuCode: product.skuCode,
    categoryName: product.category?.name ?? null,
    globalWholesalePrice: product.globalWholesalePrice,
  }
}
