import { DropdownSelect } from '@/components/DropdownMenu'
import type { ProductFilterOptions } from '@/lib/api'
import { useMemo, useState } from 'react'

const initialFormState = {
  title: '',
  skuCode: '',
  globalWholesalePrice: '',
  brandId: '',
  categoryId: '',
  subCategoryId: '',
  segmentId: '',
  styleId: '',
}

export type ProductFormValues = typeof initialFormState

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>
  filters: ProductFilterOptions | undefined
  isLoadingFilters?: boolean
  isSubmitting?: boolean
  onSubmit: (values: ProductFormValues) => Promise<void> | void
  submitLabel?: string
}

export function ProductForm({
  initialValues,
  filters,
  isLoadingFilters = false,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save product',
}: ProductFormProps) {
  const [formState, setFormState] = useState<ProductFormValues>(() => ({
    ...initialFormState,
    ...initialValues,
    globalWholesalePrice:
      typeof initialValues?.globalWholesalePrice === 'number'
        ? String(initialValues.globalWholesalePrice)
        : initialValues?.globalWholesalePrice ?? '',
  }))
  const [formError, setFormError] = useState<string | null>(null)

  const filteredSubCategories = useMemo(() => {
    const all = filters?.subCategories ?? []
    if (!formState.categoryId) return all
    return all.filter((sub) => sub.categoryId === formState.categoryId)
  }, [filters?.subCategories, formState.categoryId])

  const filteredStyles = useMemo(() => {
    const all = filters?.styles ?? []
    if (!formState.subCategoryId) return []
    return all.filter((style) => style.subCategoryId === formState.subCategoryId)
  }, [filters?.styles, formState.subCategoryId])

  const brandOptions =
    filters?.brands.map((brand) => ({ value: brand._id, label: brand.name })) ??
    []
  const categoryOptions =
    filters?.categories.map((category) => ({
      value: category._id,
      label: category.name,
    })) ?? []
  const segmentOptions =
    filters?.segments.map((segment) => ({
      value: segment._id,
      label: segment.name,
    })) ?? []
  const subCategoryOptions = filteredSubCategories.map((sub) => ({
    value: sub._id,
    label: sub.name,
  }))
  const styleOptions = filteredStyles.map((style) => ({
    value: style._id,
    label: style.name,
  }))

  function updateField(name: keyof ProductFormValues, value: string) {
    setFormState((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'categoryId') {
        next.subCategoryId = ''
        next.styleId = ''
      }
      if (name === 'subCategoryId') {
        next.styleId = ''
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const requiredFields: Array<[keyof ProductFormValues, string]> = [
      ['title', 'Product name is required'],
      ['skuCode', 'SKU is required'],
      ['globalWholesalePrice', 'Wholesale price is required'],
      ['brandId', 'Brand is required'],
      ['categoryId', 'Category is required'],
      ['subCategoryId', 'Subcategory is required'],
      ['segmentId', 'Segment is required'],
    ]

    for (const [field, message] of requiredFields) {
      if (!formState[field].trim()) {
        setFormError(message)
        return
      }
    }

    const price = Number(formState.globalWholesalePrice)
    if (Number.isNaN(price) || price < 0) {
      setFormError('Wholesale price must be a valid non-negative number')
      return
    }

    await onSubmit({
      title: formState.title.trim(),
      skuCode: formState.skuCode.trim(),
      globalWholesalePrice: String(price),
      brandId: formState.brandId,
      categoryId: formState.categoryId,
      subCategoryId: formState.subCategoryId,
      segmentId: formState.segmentId,
      styleId: formState.styleId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Product name"
          placeholder="High Garden Pinot Noir 2021"
          value={formState.title}
          onChange={(value) => updateField('title', value)}
        />
        <InputField
          label="SKU code"
          placeholder="HGVPIN216"
          value={formState.skuCode}
          onChange={(value) => updateField('skuCode', value)}
        />
        <InputField
          label="Global wholesale price"
          type="number"
          placeholder="279.06"
          value={formState.globalWholesalePrice}
          onChange={(value) => updateField('globalWholesalePrice', value)}
          step="0.01"
        />
        <DropdownSelect
          label="Brand"
          placeholder="Select brand"
          value={formState.brandId}
          onChange={(value) => updateField('brandId', value)}
          options={brandOptions}
          disabled={isLoadingFilters}
        />
        <DropdownSelect
          label="Category"
          placeholder="Select category"
          value={formState.categoryId}
          onChange={(value) => updateField('categoryId', value)}
          options={categoryOptions}
          disabled={isLoadingFilters}
        />
        <DropdownSelect
          label="Subcategory"
          placeholder={
            formState.categoryId ? 'Select subcategory' : 'Select a category first'
          }
          value={formState.subCategoryId}
          onChange={(value) => updateField('subCategoryId', value)}
          options={subCategoryOptions}
          disabled={!formState.categoryId || subCategoryOptions.length === 0}
        />
        <DropdownSelect
          label="Segment"
          placeholder="Select segment"
          value={formState.segmentId}
          onChange={(value) => updateField('segmentId', value)}
          options={segmentOptions}
          disabled={isLoadingFilters}
        />
        <DropdownSelect
          label="Style (optional)"
          placeholder={
            formState.subCategoryId
              ? 'Select style'
              : 'Select a subcategory first'
          }
          value={formState.styleId}
          onChange={(value) => updateField('styleId', value)}
          options={styleOptions}
          disabled={!formState.subCategoryId || styleOptions.length === 0}
          allowClear
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  step?: string
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
}: InputFieldProps) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </label>
  )
}
