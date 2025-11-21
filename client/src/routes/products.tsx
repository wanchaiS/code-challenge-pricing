import { AddProduct } from '@/components/AddProduct'
import { EditProduct } from '@/components/EditProduct'
import {
  deleteProduct,
  fetchProductFilters,
  fetchProducts,
} from '@/lib/api'
import type { ProductSummary } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(
    null,
  )
  const [productToDelete, setProductToDelete] = useState<ProductSummary | null>(
    null,
  )

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const filtersQuery = useQuery({
    queryKey: ['product-filters'],
    queryFn: fetchProductFilters,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  async function confirmDelete() {
    if (!productToDelete) return
    await deleteMutation.mutateAsync(productToDelete._id)
    setProductToDelete(null)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Products
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Manage your catalog
          </h2>
          <p className="text-sm text-slate-500">
            View every SKU with brand, category and pricing context.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
          disabled={filtersQuery.isLoading}
        >
          {showAddForm ? 'Close' : 'Add Product'}
        </button>
      </header>

      <AddProduct
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        filters={filtersQuery.data}
        isLoadingFilters={filtersQuery.isLoading}
      />

      <EditProduct
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        filters={filtersQuery.data}
        isLoadingFilters={filtersQuery.isLoading}
      />

      <Dialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              {productToDelete
                ? `This will permanently remove ${productToDelete.title} and its pricing from future profiles.`
                : 'This will permanently remove the product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setProductToDelete(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {productsQuery.isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : productsQuery.error ? (
          <div className="p-6 text-sm text-red-600">
            {productsQuery.error instanceof Error
              ? productsQuery.error.message
              : 'Failed to load products'}
          </div>
        ) : productsQuery.data && productsQuery.data.length > 0 ? (
          <ProductsTable
            products={productsQuery.data}
            onEdit={(product) => setEditingProduct(product)}
            onDelete={(product) => setProductToDelete(product)}
            disableActions={deleteMutation.isPending}
          />
        ) : (
          <div className="p-12 text-center text-slate-500">
            No products found. Once you add items, they will appear here.
          </div>
        )}
      </div>
    </section>
  )
}

type ProductsTableProps = {
  products: Awaited<ReturnType<typeof fetchProducts>>
  onEdit: (product: ProductSummary) => void
  onDelete: (product: ProductSummary) => void
  disableActions?: boolean
}

function ProductsTable({ products, onEdit, onDelete, disableActions }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">SKU</th>
            <th className="px-6 py-4">Brand</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Segment</th>
            <th className="px-6 py-4">Style</th>
            <th className="px-6 py-4 text-right">Wholesale</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr
              key={product._id}
              className="hover:bg-emerald-50/30 transition-colors"
            >
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{product.title}</p>
              </td>
              <td className="px-6 py-4 text-slate-500">{product.skuCode}</td>
              <td className="px-6 py-4">
                {product.brand ? (
                  product.brand.name
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-slate-900">
                  {product.category ? (
                    product.category.name
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {product.subCategory ? product.subCategory.name : ''}
                </div>
              </td>
              <td className="px-6 py-4">
                {product.segment ? (
                  product.segment.name
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                {product.style ? (
                  product.style.name
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">
                {new Intl.NumberFormat('en-AU', {
                  style: 'currency',
                  currency: 'AUD',
                  maximumFractionDigits: 2,
                }).format(product.globalWholesalePrice)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label={`Edit ${product.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={disableActions}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed"
                    aria-label={`Delete ${product.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
