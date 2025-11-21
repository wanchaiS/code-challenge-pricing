import { DropdownSelect } from '@/components/DropdownMenu'
import {
  fetchProductFilters,
  searchProducts,
  type ProductFilterOptions,
  type ProductSummary,
} from '@/lib/api'
import { useDebounce } from '@/lib/hooks/useDebounce'
import type { SelectionType } from '@/lib/types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { LoaderCircle, Search } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { CategoryDropdown } from './CategoryDropdown'

type FilterKey =
  | 'search'
  | 'categoryId'
  | 'subCategoryId'
  | 'segmentId'
  | 'brandId'
  | 'styleId'

interface FilterState {
  search: string
  categoryId: string
  subCategoryId: string
  segmentId: string
  brandId: string
  searchField: '' | 'title' | 'skuCode'
  styleId: string
}

interface SearchProductsProps {
  selectionType: SelectionType
  onSelectionTypeChange: (type: SelectionType) => void
  selectedIds: string[]
  onToggleProduct: (product: ProductSummary, checked: boolean) => void
  profileName: string
}

export function SearchProducts({
  selectionType,
  onSelectionTypeChange,
  selectedIds,
  onToggleProduct,
  profileName,
}: SearchProductsProps) {
  // ================== Filters state ==================
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: '',
    subCategoryId: '',
    segmentId: '',
    brandId: '',
    searchField: '',
    styleId: '',
  })

  const debouncedSearch = useDebounce(filters.search, 800)

  // ================== Handlers for filters state change ==================
  const setCategoryFilter = (categoryId: string) => {
    if (categoryId !== filters.categoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryId,
        subCategoryId: '',
        styleId: '',
      }))
    }
  }

  const setSubCategoryFilter = (categoryId: string, subCategoryId: string) => {
    // only update if changed, so we only reset styleId when necessary
    if (subCategoryId != filters.subCategoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryId,
        subCategoryId,
        styleId: '',
      }))
    }
  }

  const clearCategoryFilters = () => {
    setFilters((prev) => ({
      ...prev,
      categoryId: '',
      subCategoryId: '',
    }))
  }

  const handleScopeChange = (value: '' | 'title' | 'skuCode') => {
    setFilters((prev) => ({ ...prev, searchField: value }))
  }

  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      categoryId: '',
      subCategoryId: '',
      segmentId: '',
      brandId: '',
      styleId: '',
      searchField: '',
    }))
  }

  // ======================================================================

  // filters to apply in the products search query
  const appliedFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      searchField: filters.searchField === '' ? undefined : filters.searchField,
      categoryId: filters.categoryId || undefined,
      subCategoryId: filters.subCategoryId || undefined,
      segmentId: filters.segmentId || undefined,
      brandId: filters.brandId || undefined,
      styleId: filters.styleId || undefined,
    }),
    [
      debouncedSearch,
      filters.brandId,
      filters.categoryId,
      filters.styleId,
      filters.searchField,
      filters.segmentId,
      filters.subCategoryId,
    ],
  )

  // ================== Data fetching ==================
  const filterOptionsQuery = useQuery<ProductFilterOptions>({
    queryKey: ['product-filters'],
    queryFn: fetchProductFilters,
    staleTime: 5 * 60 * 1000,
  })

  const isAllMode = selectionType === 'all'

  const productsQuery = useQuery<ProductSummary[]>({
    queryKey: ['products', appliedFilters],
    queryFn: () => searchProducts(appliedFilters),
    placeholderData: keepPreviousData,
    enabled:
      !isAllMode &&
      (Boolean(appliedFilters.search && appliedFilters.search.length >= 2) ||
        Boolean(appliedFilters.brandId) ||
        Boolean(appliedFilters.categoryId) ||
        Boolean(appliedFilters.segmentId) ||
        Boolean(appliedFilters.subCategoryId)),
  })
  // =====================================================

  // only show styles when there are styles for the selected sub-category
  // is sub category selected?
  // are there styles for this sub-category?
  // if no, hide style filter but not clear the state (we clear it in sub-category on-change)
  const shouldShowStyle = useMemo(() => {
    // no sub-category selected
    if (!filters.subCategoryId) return false
    // check if there are styles for the selected sub-category
    const styles = filterOptionsQuery.data?.styles ?? []
    const matched = styles.find(
      (style) => style.subCategoryId === filters.subCategoryId,
    )
    return !!matched
  }, [filters.subCategoryId, filterOptionsQuery.data?.styles])

  // Filters chip labels
  const activeFilterLabels = useMemo(() => {
    const opts = filterOptionsQuery.data
    if (!opts) return []
    const labels: string[] = []
    if (filters.search) {
      labels.push(`Search: “${filters.search}”`)
    }
    if (filters.categoryId) {
      const category = opts.categories.find((c) => c._id === filters.categoryId)
      if (category) labels.push(category.name)
    }
    if (filters.subCategoryId) {
      const sub = opts.subCategories.find(
        (s) => s._id === filters.subCategoryId,
      )
      if (sub) labels.push(sub.name)
    }
    if (filters.segmentId) {
      const segment = opts.segments.find((s) => s._id === filters.segmentId)
      if (segment) labels.push(segment.name)
    }
    if (filters.brandId) {
      const brand = opts.brands.find((b) => b._id === filters.brandId)
      if (brand) labels.push(brand.name)
    }
    if (filters.styleId && opts.styles) {
      const style = opts.styles.find((s) => s._id === filters.styleId)
      if (style) labels.push(style.name)
    }
    return labels
  }, [
    filterOptionsQuery.data,
    filters.brandId,
    filters.categoryId,
    filters.search,
    filters.styleId,
    filters.segmentId,
    filters.subCategoryId,
  ])

  const products = productsQuery.data ?? []
  const filtersLoading = filterOptionsQuery.isLoading
  const selectedSet = new Set(selectedIds)

  const handleToggleProduct = (product: ProductSummary, checked: boolean) => {
    if (selectionType === 'all') return
    onToggleProduct(product, checked)
  }

  const handleSelectAllVisible = () => {
    if (selectionType !== 'multiple' || !products.length) return
    products.forEach((product) => {
      if (!selectedSet.has(product._id)) {
        onToggleProduct(product, true)
      }
    })
  }

  const handleDeselectAllVisible = () => {
    if (selectionType === 'all' || !products.length) return
    products.forEach((product) => {
      if (selectedSet.has(product._id)) {
        onToggleProduct(product, false)
      }
    })
  }

  const getSectionTypeSection = () => {
    return (
      <div>
        <p className="text-xs tracking-wide text-slate-500">
          You are creating a Pricing Profile for
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
          {(['one', 'multiple', 'all'] as SelectionType[]).map((type, idx) => (
            <Fragment key={type}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="selection-type"
                  className="sr-only"
                  value={type}
                  checked={selectionType === type}
                  onChange={() => onSelectionTypeChange(type)}
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
                {type === 'one' && 'One Product'}
                {type === 'multiple' && 'Multiple Products'}
                {type === 'all' && 'All Products'}
              </label>
              {idx < 2 && (
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-slate-200 md:inline-block"
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  const getSearchSection = () => {
    if (isAllMode) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-emerald-50/40 p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            All products are included
          </p>
          <p className="mt-1 text-sm text-slate-600">
            This pricing profile applies to your product range.
          </p>
        </div>
      )
    }

    return (
      <>
        <div className="space-y-4 rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="grid gap-4 grid-cols-3 md:grid-cols-5">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="product-search"
                  type="search"
                  value={filters.search}
                  onChange={(e) =>
                    handleFilterChange('search', e.target.value.slice(0, 100))
                  }
                  placeholder="Search"
                  className="w-full rounded-xl border border-slate-200 px-10 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <DropdownSelect
              label="Search scope"
              placeholder="All fields"
              value={filters.searchField}
              onChange={(value) =>
                handleScopeChange(value as '' | 'title' | 'skuCode')
              }
              options={[
                { label: 'Product title', value: 'title' },
                { label: 'SKU only', value: 'skuCode' },
              ]}
              allowClear
            />
            <CategoryDropdown
              loading={filtersLoading}
              categories={filterOptionsQuery.data?.categories ?? []}
              subCategories={filterOptionsQuery.data?.subCategories ?? []}
              selectedCategoryId={filters.categoryId}
              selectedSubCategoryId={filters.subCategoryId}
              onSelectCategory={setCategoryFilter}
              onSelectSubCategory={setSubCategoryFilter}
              onClear={clearCategoryFilters}
            />
            <DropdownSelect
              label="Segment"
              value={filters.segmentId}
              onChange={(value) => handleFilterChange('segmentId', value)}
              options={(filterOptionsQuery.data?.segments ?? []).map(
                (segment) => ({
                  label: segment.name,
                  value: segment._id,
                }),
              )}
              disabled={filtersLoading}
            />
            <DropdownSelect
              label="Brand"
              value={filters.brandId}
              onChange={(value) => handleFilterChange('brandId', value)}
              options={(filterOptionsQuery.data?.brands ?? []).map((brand) => ({
                label: brand.name,
                value: brand._id,
              }))}
              disabled={filtersLoading}
            />
            {shouldShowStyle ? (
              <DropdownSelect
                label="Style"
                value={filters.styleId}
                onChange={(value) => handleFilterChange('styleId', value)}
                options={
                  filterOptionsQuery.data?.styles.map((style) => ({
                    label: style.name,
                    value: style._id,
                  })) ?? []
                }
                disabled={filtersLoading}
              />
            ) : null}
          </div>

          {(filters.search ||
            filters.categoryId ||
            filters.subCategoryId ||
            filters.segmentId ||
            filters.brandId) && (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-emerald-600 underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex gap-2 items-center">
                <p className="text-sm font-semibold text-slate-900">
                  Showing {products.length}{' '}
                  {products.length === 1 ? 'result' : 'results'}
                </p>
                {productsQuery.isFetching && (
                  <LoaderCircle className="animate-spin h-4 w-4" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(activeFilterLabels.length
                  ? activeFilterLabels
                  : ['Product Name or SKU']
                ).map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            {selectionType === 'multiple' && !!products.length && (
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={handleDeselectAllVisible}
                  className="flex items-center gap-1 rounded-full border border-transparent px-3 py-1 hover:border-slate-200"
                >
                  Deselect all
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="flex items-center gap-1 rounded-full border border-transparent px-3 py-1 hover:border-slate-200"
                >
                  Select all
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {products.length && !productsQuery.isLoading ? (
              products.map((product) => {
                const checked = selectedSet.has(product._id) || isAllMode
                const avatarText = product.title.charAt(0).toUpperCase()
                return (
                  <label
                    key={product._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition ${checked ? 'ring-emerald-200' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className=" h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={checked}
                      disabled={isAllMode}
                      onChange={(e) =>
                        handleToggleProduct(product, e.target.checked)
                      }
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                        {avatarText}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          SKU {product.skuCode}
                        </p>
                      </div>
                    </div>
                  </label>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                No products match your filters. Try adjusting the search
                criteria.
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  const summary =
    selectionType === 'all'
      ? ''
      : selectedIds.length === 0
        ? 'Select at least one product to begin configuring pricing.'
        : `You’ve selected ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}. These will be added (${profileName}).`

  return (
    <div className="space-y-6">
      {getSectionTypeSection()}
      {getSearchSection()}
      <p className="text-xs text-slate-500">{summary}</p>
    </div>
  )
}
