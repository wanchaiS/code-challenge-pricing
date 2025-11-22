import type { fetchProducts, ProductResponse } from '@/lib/api'
import { Pencil, Trash2 } from 'lucide-react'

type ProductsTableProps = {
  products: Awaited<ReturnType<typeof fetchProducts>>
  onEdit: (product: ProductResponse) => void
  onDelete: (product: ProductResponse) => void
  disableActions?: boolean
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  disableActions,
}: ProductsTableProps) {
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
                    className="rounded-full border cursor-pointer border-slate-200 p-2 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label={`Edit ${product.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={disableActions}
                    className="rounded-full border cursor-pointer border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed"
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
