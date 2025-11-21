import type { SelectionType } from './types'

export interface PricingProfile {
  _id: string
  name: string
  selectionType: SelectionType
  updatedAt: string
  createdAt: string
}

export interface ReferenceOption {
  _id: string
  name: string
}

export interface SubCategoryOption extends ReferenceOption {
  categoryId: string
}

export interface ProductSummary {
  _id: string
  title: string
  skuCode: string
  globalWholesalePrice: number
  brand: ReferenceOption | null
  category: ReferenceOption | null
  subCategory: ReferenceOption | null
  segment: ReferenceOption | null
  style: (ReferenceOption & { subCategoryId?: string }) | null
}

export interface StyleOption extends ReferenceOption {
  subCategoryId: string
}

export interface ProductFilterOptions {
  categories: ReferenceOption[]
  subCategories: SubCategoryOption[]
  segments: ReferenceOption[]
  brands: ReferenceOption[]
  styles: StyleOption[]
}

export interface ProfileDetail {
  profile: PricingProfile & {
    adjustmentType: 'fixed' | 'dynamic'
    incrementType: 'increase' | 'decrease'
    adjustmentValueForAll: number | null
    productAdjustments: { productId: string; adjustmentValue: number }[]
    basedOn: string | null
  }
  items: ProfileDetailItem[]
}

export interface ProfileDetailItem {
  product: {
    _id: string
    title: string
    skuCode: string
    category: ReferenceOption | null
    globalWholesalePrice: number
  }
  basedOnPrice: number
  adjustmentValue: number
  newPrice: number
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(errorBody || res.statusText)
  }

  return res.json() as Promise<T>
}

export function fetchProfiles() {
  return request<PricingProfile[]>('/api/pricing-profiles')
}

export function createProfile(input: {
  name: string
  selectionType: SelectionType
}) {
  return request<PricingProfile>('/api/pricing-profiles', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function fetchProfileDetail(id: string) {
  return request<ProfileDetail>(`/api/pricing-profiles/${id}`)
}

export function updateProfile(id: string, payload: unknown) {
  return request<PricingProfile>(`/api/pricing-profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function previewProfile(id: string, payload: unknown) {
  return request<{ items: ProfileDetailItem[] }>(
    `/api/pricing-profiles/${id}/preview`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export interface ProductSearchParams {
  search?: string
  searchField?: 'title' | 'skuCode'
  categoryId?: string
  subCategoryId?: string
  segmentId?: string
  brandId?: string
  styleId?: string
}

export function fetchProductFilters() {
  return request<ProductFilterOptions>('/api/products/filters')
}

export function searchProducts(params: ProductSearchParams) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })
  const queryString = searchParams.toString()
  const url = queryString
    ? `/api/products/search?${queryString}`
    : '/api/products/search'
  return request<ProductSummary[]>(url)
}
