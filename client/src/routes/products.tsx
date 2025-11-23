import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ProductResponse } from '@/lib/api'
import { deleteProduct, fetchProductReferences, fetchProducts } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AddProduct } from './-products/AddProduct'
import { EditProduct } from './-products/EditProduct'
import { ProductsTable } from './-products/ProductsTable'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null,
  )
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null)

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const referencesQuery = useQuery({
    queryKey: ['product-references'],
    queryFn: fetchProductReferences,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  function confirmDelete() {
    if (!productToDelete) return
    deleteMutation.mutate(productToDelete._id)
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
          className="rounded-full cursor-pointer bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
          disabled={referencesQuery.isLoading}
        >
          {showAddForm ? 'Close' : 'Add Product'}
        </button>
      </header>

      <AddProduct
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        references={referencesQuery.data}
        isLoadingFilters={referencesQuery.isLoading}
      />

      <EditProduct
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        references={referencesQuery.data}
        isLoadingFilters={referencesQuery.isLoading}
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
              className="rounded-full cursor-pointer border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-full cursor-pointer bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {deleteMutation.error && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700"
          >
            Unable to delete:{' '}
            {deleteMutation.error instanceof Error &&
            deleteMutation.error.message
              ? deleteMutation.error.message
              : 'Something went wrong'}
          </div>
        )}
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
