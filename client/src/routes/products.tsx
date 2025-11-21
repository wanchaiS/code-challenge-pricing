import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Products
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Manage your product pricing
        </h2>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-base text-slate-500">
          Product tools are coming soon. In the meantime, continue managing your
          profiles.
        </p>
      </div>
    </section>
  )
}
