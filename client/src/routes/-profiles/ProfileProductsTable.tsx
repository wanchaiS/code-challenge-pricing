import type { AdjustmentType, IncrementType, SelectionType } from '@/lib/types'
import { cn } from '@/lib/utils'
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

  const adjustmentFieldClass =
    'flex h-full min-h-[42px] min-w-[140px] w-full items-center justify-end border px-3 text-sm font-semibold text-emerald-700'

  const renderAdjustmentCell = (item: TableProduct) => {
    const displayValue = isAllMode
      ? formatAdjustmentDisplay(adjustmentValueForAll ?? 0)
      : formatAdjustmentDisplay(item.adjustmentValue)

    if (!isAllMode && editingCell?.id === item.productId) {
      return (
        <div
          className={cn(adjustmentFieldClass, 'border-emerald-200 bg-white')}
        >
          <input
            autoFocus
            type="number"
            min={0}
            value={editingCell.value}
            onChange={(event) => onChangeEditingValue(event.target.value)}
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
        </div>
      )
    }

    return (
      <div
        className={cn(
          adjustmentFieldClass,
          'border-emerald-200 bg-emerald-50 text-emerald-700 text-right',
        )}
      >
        {displayValue}
      </div>
    )
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
              <th className="px-4 py-2 text-right font-medium">
                Based on Price
              </th>
              <th className="px-4 py-2 font-medium text-right">Adjustment</th>
              <th className="px-4 py-2 text-right font-medium">New Price</th>
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
                          onToggleSelection(
                            item.productId,
                            event.target.checked,
                          )
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
                    <td className="px-4 py-3 text-slate-900 text-right">
                      ${basedOnPrice}
                    </td>
                    <td
                      role="button"
                      tabIndex={0}
                      className="w-40 p-0"
                      onDoubleClick={() =>
                        onStartEditing(item.productId, item.adjustmentValue)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          editingCell?.id !== item.productId
                        ) {
                          onStartEditing(item.productId, item.adjustmentValue)
                        }
                      }}
                    >
                      {renderAdjustmentCell(item)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-right">
                      {newPrice !== undefined ? `$${newPrice}` : '—'}
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
