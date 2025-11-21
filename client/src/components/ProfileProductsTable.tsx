import type { AdjustmentType, IncrementType, SelectionType } from '@/lib/types'
import { RefreshCw } from 'lucide-react'
import { useMemo } from 'react'

interface TableProduct {
  productId: string
  title: string
  skuCode: string
  categoryName: string | null
  globalWholesalePrice: number
  adjustmentValue: number
}

interface ProfileProductsTableProps {
  selectionType: SelectionType
  adjustmentType: AdjustmentType
  incrementType: IncrementType
  items: TableProduct[]
  previewMap: Map<string, { basedOnPrice: number; newPrice: number }>
  adjustmentValueForAll: number | null
  onChangeAdjustmentForAll: (value: number | null) => void
  onRemoveSelectedProducts: (productIds: string[]) => void
  onRefresh: () => void
  canRefresh: boolean
  refreshing: boolean
  needsRefreshIndicator: boolean
  selectedIds: string[]
  onToggleSelection: (productId: string, checked: boolean) => void
  onSelectAllRows: (productIds: string[]) => void
  onClearSelection: () => void
  editingCell: { id: string; value: string } | null
  onStartEditing: (productId: string, currentValue: number) => void
  onChangeEditingValue: (value: string) => void
  onCommitEditing: () => void
  onCancelEditing: () => void
}

export function ProfileProductsTable({
  selectionType,
  adjustmentType,
  incrementType,
  items,
  previewMap,
  adjustmentValueForAll,
  onChangeAdjustmentForAll,
  onRemoveSelectedProducts,
  onRefresh,
  canRefresh,
  refreshing,
  needsRefreshIndicator,
  selectedIds,
  onToggleSelection,
  onSelectAllRows,
  onClearSelection,
  editingCell,
  onStartEditing,
  onChangeEditingValue,
  onCommitEditing,
  onCancelEditing,
}: ProfileProductsTableProps) {
  const isAllMode = selectionType === 'all'
  const adjustmentUnit = adjustmentType === 'fixed' ? 'AUD' : '%'
  const allSelectableIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  )
  const visibleSelectedIds = useMemo(() => {
    const productIdSet = new Set(allSelectableIds)
    return selectedIds.filter((id) => productIdSet.has(id))
  }, [selectedIds, allSelectableIds])
  const selectedSet = useMemo(
    () => new Set(visibleSelectedIds),
    [visibleSelectedIds],
  )
  const removeDisabled = isAllMode || visibleSelectedIds.length === 0
  const headerCheckboxDisabled = isAllMode || items.length === 0
  const allChecked =
    !isAllMode &&
    !!allSelectableIds.length &&
    visibleSelectedIds.length === allSelectableIds.length

  const formatAdjustmentDisplay = (value: number) => {
    const absValue = Math.abs(value).toFixed(2)
    const sign = incrementType === 'increase' ? '+$' : '-$'
    if (adjustmentType === 'fixed') {
      return `${sign} ${absValue}`
    }
    const percentSign = incrementType === 'increase' ? '+' : '-'
    return `${percentSign} ${absValue} %`
  }

  return (
    <div className="space-y-5">
      {isAllMode ? (
        <div>
          <label className="text-xs tracking-wide text-slate-500">
            Adjustment value for all products
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              value={adjustmentValueForAll ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                onChangeAdjustmentForAll(raw === '' ? null : Number(raw))
              }}
              className="w-40 rounded-xl border border-slate-200 px-4 py-2"
            />
            <span className="text-sm text-slate-500">{adjustmentUnit}</span>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (removeDisabled) return
                onRemoveSelectedProducts(visibleSelectedIds)
                onClearSelection()
              }}
              disabled={removeDisabled}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              Remove
            </button>
            {!isAllMode && (
              <p className="text-xs text-slate-500">
                Select rows to remove them from this profile.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || !canRefresh}
            className="relative cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing…' : 'Refresh New Price Table'}
            <RefreshCw className="h-4 w-4" />
            {needsRefreshIndicator && !refreshing && (
              <>
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                <span className="sr-only">Preview is out of date</span>
              </>
            )}
          </button>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-12 px-4 py-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={allChecked}
                  onChange={(event) => {
                    if (isAllMode) return
                    if (event.target.checked) {
                      onSelectAllRows(allSelectableIds)
                    } else {
                      onClearSelection()
                    }
                  }}
                  disabled={headerCheckboxDisabled}
                  aria-label="Select all rows"
                />
              </th>
              <th className="px-4 py-2 text-left font-medium">Product Title</th>
              <th className="px-4 py-2 text-left font-medium">SKU Code</th>
              <th className="px-4 py-2 text-left font-medium">Category</th>
              <th className="px-4 py-2 text-left font-medium">
                Based on Price
              </th>
              <th className="px-4 py-2 text-left font-medium">Adjustment</th>
              <th className="px-4 py-2 text-left font-medium">New Price</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No products selected yet.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const checked = selectedSet.has(item.productId)
                const preview = previewMap.get(item.productId)
                const basedOnPrice =
                  preview?.basedOnPrice ?? item.globalWholesalePrice
                const newPrice = preview?.newPrice
                return (
                  <tr
                    key={item.productId}
                    className="divide-x divide-slate-100"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          onToggleSelection(item.productId, event.target.checked)
                        }
                        disabled={isAllMode}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        aria-label="Select product row"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.skuCode}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.categoryName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      ${basedOnPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {isAllMode ? (
                        <div className="inline-flex w-32 justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                          {formatAdjustmentDisplay(adjustmentValueForAll ?? 0)}
                        </div>
                      ) : editingCell?.id === item.productId ? (
                        <div className="inline-flex w-32 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
                          {adjustmentType === 'fixed' ? (
                            <span className="text-slate-500">$</span>
                          ) : null}
                          <input
                            autoFocus
                            type="number"
                            value={editingCell.value}
                            onChange={(event) =>
                              onChangeEditingValue(event.target.value)
                            }
                            onBlur={onCommitEditing}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                onCommitEditing()
                              } else if (event.key === 'Escape') {
                                onCancelEditing()
                              }
                            }}
                            className="w-full border-none bg-transparent text-center text-sm font-semibold text-emerald-700 focus:outline-none"
                          />
                          {adjustmentType === 'dynamic' ? (
                            <span className="text-slate-500">%</span>
                          ) : null}
                        </div>
                      ) : (
                        <div
                          className="inline-flex w-32 cursor-pointer justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                          onDoubleClick={() =>
                            onStartEditing(item.productId, item.adjustmentValue)
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              onStartEditing(item.productId, item.adjustmentValue)
                            }
                          }}
                        >
                          {formatAdjustmentDisplay(item.adjustmentValue)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {newPrice !== undefined ? `$${newPrice.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Preview uses the current “Based on” profile and adjustment settings.
      </p>
    </div>
  )
}
