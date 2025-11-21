import { ProductForm, type ProductFormValues } from '@/components/ProductForm'
import type { ProductFilterOptions } from '@/lib/api'
import { createProduct } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type AddProductProps = {
  open: boolean
  filters: ProductFilterOptions | undefined
  isLoadingFilters: boolean
  onClose: () => void
}

export function AddProduct({
  open,
  filters,
  isLoadingFilters,
  onClose,
}: AddProductProps) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
  })

  async function handleSubmit(values: ProductFormValues) {
    await createMutation.mutateAsync({
      title: values.title,
      skuCode: values.skuCode,
      globalWholesalePrice: Number(values.globalWholesalePrice),
      brandId: values.brandId,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      segmentId: values.segmentId,
      styleId: values.styleId || undefined,
    })
  }

  if (!open) return null

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900">
          Create a product
        </h3>
        <p className="text-sm text-slate-500">
          Provide product details and pricing so it is available for profiles.
        </p>
      </div>
      <ProductForm
        filters={filters}
        isLoadingFilters={isLoadingFilters}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
