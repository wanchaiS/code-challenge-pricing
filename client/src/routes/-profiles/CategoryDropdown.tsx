import type { ProductReferences } from '@/lib/api'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu'

interface CategoryDropdownProps {
  loading: boolean
  categories: ProductReferences['categories']
  subCategories: ProductReferences['subCategories']
  selectedCategoryId: string
  selectedSubCategoryId: string
  onSelectCategory: (categoryId: string) => void
  onSelectSubCategory: (categoryId: string, subCategoryId: string) => void
  onClear: () => void
}

export function CategoryDropdown({
  loading,
  categories,
  subCategories,
  selectedCategoryId,
  selectedSubCategoryId,
  onSelectCategory,
  onSelectSubCategory,
  onClear,
}: CategoryDropdownProps) {
  const currentCategory =
    categories.find((c) => c._id === selectedCategoryId) ?? null
  const currentSub =
    subCategories.find((s) => s._id === selectedSubCategoryId) ?? null

  const buttonLabel = loading
    ? 'Loading filters…'
    : currentSub
      ? `${currentCategory?.name ?? 'Category'} • ${currentSub.name}`
      : (currentCategory?.name ?? 'Category')

  const hasSelection = Boolean(selectedCategoryId || selectedSubCategoryId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Categories</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onClear} active={!hasSelection}>
          All categories
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {categories.map((category) => {
          const subs = subCategories.filter(
            (sub) => sub.categoryId === category._id,
          )
          return (
            <div key={category._id} className="space-y-1">
              <DropdownMenuItem
                onSelect={() => onSelectCategory(category._id)}
                active={
                  selectedCategoryId === category._id && !selectedSubCategoryId
                }
              >
                {category.name}
              </DropdownMenuItem>
              {subs.length > 0 && (
                <div className="border-l border-slate-100 pl-3">
                  {subs.map((sub) => (
                    <DropdownMenuItem
                      key={sub._id}
                      className="text-slate-500"
                      active={selectedSubCategoryId === sub._id}
                      onSelect={() =>
                        onSelectSubCategory(sub.categoryId, sub._id)
                      }
                    >
                      {sub.name}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
