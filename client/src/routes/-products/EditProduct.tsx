import type { ProductReferences, ProductResponse } from '@/lib/api'
import { updateProduct } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductForm, type ProductFormValues } from './ProductForm'

type EditProductProps = {
  product: ProductResponse | null
  references: ProductReferences | undefined
  isLoadingFilters: boolean
  onClose: () => void
}

export function EditProduct({
  product,
  references,
  isLoadingFilters,
  onClose,
}: EditProductProps) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      updateProduct(id, {
        title: values.title,
        skuCode: values.skuCode,
        globalWholesalePrice: Number(values.globalWholesalePrice),
        brandId: values.brandId,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        segmentId: values.segmentId,
        styleId: values.styleId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
  })

  if (!product) return null

  const initialValues: Partial<ProductFormValues> = {
    title: product.title,
    skuCode: product.skuCode,
    globalWholesalePrice: String(product.globalWholesalePrice),
    brandId: product.brand?._id ?? '',
    categoryId: product.category?._id ?? '',
    subCategoryId: product.subCategory?._id ?? '',
    segmentId: product.segment?._id ?? '',
    styleId: product.style?._id ?? '',
  }

  return (
    <div className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Edit {product.title}
          </h3>
          <p className="text-sm text-slate-500">
            Update product details and pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-emerald-700 underline"
        >
          Cancel
        </button>
      </div>
      <ProductForm
        initialValues={initialValues}
        references={references}
        isLoadingFilters={isLoadingFilters}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync({ id: product._id, values })
        }}
        submitLabel="Update product"
      />
    </div>
  )
}
