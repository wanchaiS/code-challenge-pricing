import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  previewProfile,
  updateProfile,
  type ProfileDetail,
  type ProfileDetailItem,
} from '../../lib/api'
import {
  SelectionType,
  type AdjustmentType,
  type IncrementType,
  type ProductAdjustment,
} from '../../lib/types'

type ProfileDraftPayload = Omit<ProfileDraft, 'productAdjustments'> & {
  productAdjustments: ProductAdjustment[]
}

interface ProfileDraft {
  name: string
  selectionType: SelectionType
  adjustmentType: AdjustmentType
  incrementType: IncrementType
  adjustmentValueForAll: number | null
  productAdjustments: ProductDraftAdjustment[]
  basedOn: string | null
}

interface ProductDraftAdjustment {
  productId: string
  adjustmentValue: number
  product: DraftProductInfo
}

interface DraftProductInfo {
  _id: string
  title: string
  skuCode: string
  categoryName: string | null
  globalWholesalePrice: number
}

export function useProfileDraft(profileId: string, detail: ProfileDetail) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ProfileDraft>(() =>
    initDraftFromProfile(detail),
  )
  const [previewMap, setPreviewMap] = useState<
    Map<string, { basedOnPrice: number; newPrice: number }>
  >(() => initPreviewMap(detail.items))
  const [needsPreviewRefresh, setNeedsPreviewRefresh] = useState(false)

  // when profile detail changes, reset draft state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(initDraftFromProfile(detail))
    setPreviewMap(initPreviewMap(detail.items))
    setNeedsPreviewRefresh(false)
  }, [detail])

  const saveMutation = useMutation({
    mutationFn: (payload: ProfileDraftPayload) =>
      updateProfile(profileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-detail', profileId] })
    },
  })

  const previewMutation = useMutation({
    mutationFn: (payload: ProfileDraftPayload) =>
      previewProfile(profileId, payload),
    onSuccess: (data) => {
      setPreviewMap(
        new Map(
          data.items.map((item) => [
            item.product._id,
            { basedOnPrice: item.basedOnPrice, newPrice: item.newPrice },
          ]),
        ),
      )
      setNeedsPreviewRefresh(false)
      setDraft((prev) => {
        if (!prev || prev.selectionType !== SelectionType.ALL) return prev
        return {
          ...prev,
          productAdjustments: data.items.map((item) => ({
            productId: item.product._id,
            adjustmentValue: prev.adjustmentValueForAll ?? 0,
            product: mapDetailProductToDraft(item.product),
          })),
        }
      })
    },
  })

  const canPreview = useMemo(
    () =>
      draft.selectionType === SelectionType.ALL
        ? draft.adjustmentValueForAll !== null
        : draft.productAdjustments.length > 0,
    [draft],
  )

  const tableItems = useMemo(
    () =>
      draft.productAdjustments.map((adj) => ({
        productId: adj.productId,
        title: adj.product.title,
        skuCode: adj.product.skuCode,
        categoryName: adj.product.categoryName,
        globalWholesalePrice: adj.product.globalWholesalePrice,
        adjustmentValue: adj.adjustmentValue,
      })),
    [draft.productAdjustments],
  )

  const markPreviewDirty = () => {
    setNeedsPreviewRefresh(true)
  }

  const clearPreviewEntries = (ids: string[]) => {
    if (!ids.length) return
    setPreviewMap((prev) => {
      const next = new Map(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const buildPayload = useCallback(() => buildRequestPayload(draft), [draft])

  const previewProfileDraft = useCallback(() => {
    if (!canPreview) return
    previewMutation.mutate(buildPayload())
  }, [canPreview, previewMutation, buildPayload])

  const saveProfileDraft = useCallback(() => {
    saveMutation.mutate(buildPayload())
  }, [saveMutation, buildPayload])

  const initialPayloadSignature = useMemo(
    () =>
      makePayloadSignature(buildRequestPayload(initDraftFromProfile(detail))),
    [detail],
  )
  const currentPayloadSignature = useMemo(
    () => makePayloadSignature(buildPayload()),
    [buildPayload],
  )
  const hasUnsavedChanges = currentPayloadSignature !== initialPayloadSignature

  return {
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
    isPreviewing: previewMutation.isPending,
    isSaving: saveMutation.isPending,
    previewError: previewMutation.error as Error | null,
    saveError: saveMutation.error as Error | null,
  }
}

function buildRequestPayload(draft: ProfileDraft): ProfileDraftPayload {
  return {
    ...draft,
    productAdjustments:
      draft.selectionType === 'all'
        ? []
        : draft.productAdjustments.map((adj) => ({
            productId: adj.productId,
            adjustmentValue: adj.adjustmentValue,
          })),
  }
}

function makePayloadSignature(payload: ProfileDraftPayload): string {
  const normalized: ProfileDraftPayload = {
    ...payload,
    productAdjustments: [...payload.productAdjustments].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    ),
  }
  return JSON.stringify(normalized)
}

function initPreviewMap(
  items: ProfileDetailItem[],
): Map<string, { basedOnPrice: number; newPrice: number }> {
  return new Map(
    items.map((item) => [
      item.product._id,
      { basedOnPrice: item.basedOnPrice, newPrice: item.newPrice },
    ]),
  )
}

function initDraftFromProfile(profileDetail: ProfileDetail): ProfileDraft {
  const { profile, items } = profileDetail

  const enrichedAdjustments: ProductDraftAdjustment[] =
    // "all" map all items
    profile.selectionType === 'all'
      ? items.map((item) => ({
          productId: item.product._id,
          adjustmentValue: profile.adjustmentValueForAll ?? 0,
          product: mapDetailProductToDraft(item.product),
        }))
      : //  map only existing adjustments
        profile.productAdjustments
          .map((adj) => {
            const match = items.find(
              (item) => item.product._id === adj.productId,
            )
            return match
              ? {
                  productId: adj.productId,
                  adjustmentValue: adj.adjustmentValue,
                  product: mapDetailProductToDraft(match.product),
                }
              : null
          })
          .filter((entry): entry is ProductDraftAdjustment => entry !== null)

  return {
    name: profile.name,
    selectionType: profile.selectionType as SelectionType,
    adjustmentType: profile.adjustmentType as AdjustmentType,
    incrementType: profile.incrementType as IncrementType,
    adjustmentValueForAll: profile.adjustmentValueForAll,
    productAdjustments: enrichedAdjustments,
    basedOn: profile.basedOn,
  }
}

function mapDetailProductToDraft(
  product: ProfileDetailItem['product'],
): DraftProductInfo {
  return {
    _id: product._id,
    title: product.title,
    skuCode: product.skuCode,
    categoryName: product.category?.name ?? null,
    globalWholesalePrice: product.globalWholesalePrice,
  }
}
