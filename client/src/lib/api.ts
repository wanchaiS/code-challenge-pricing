import type { SelectionType } from './types'

export interface PricingProfile {
  _id: string
  name: string
  selectionType: SelectionType
  updatedAt: string
  createdAt: string
}

export interface ReferenceEntity {
  _id: string
  name: string
}

export interface SubCategoryOption extends ReferenceEntity {
  categoryId: string
}

export interface ProductResponse {
  _id: string
  title: string
  skuCode: string
  globalWholesalePrice: number
  brand: ReferenceEntity | null
  category: ReferenceEntity | null
  subCategory: ReferenceEntity | null
  segment: ReferenceEntity | null
  style: (ReferenceEntity & { subCategoryId?: string }) | null
}

export interface StyleEntity extends ReferenceEntity {
  subCategoryId: string
}

export interface ProductReferences {
  categories: ReferenceEntity[]
  subCategories: SubCategoryOption[]
  segments: ReferenceEntity[]
  brands: ReferenceEntity[]
  styles: StyleEntity[]
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
    category: ReferenceEntity | null
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

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>
  }

  return (await res.text()) as T
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

export function deleteProfile(id: string) {
  return request<void>(`/api/pricing-profiles/${id}`, {
    method: 'DELETE',
  })
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

export function fetchProductReferences() {
  return request<ProductReferences>('/api/products/references')
}

export function fetchProducts() {
  return request<ProductResponse[]>('/api/products')
}

export interface CreateProductInput {
  title: string
  skuCode: string
  globalWholesalePrice: number
  brandId: string
  categoryId: string
  subCategoryId: string
  segmentId: string
  styleId?: string
}

export function createProduct(input: CreateProductInput) {
  return request<ProductResponse>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: string, input: CreateProductInput) {
  return request<ProductResponse>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: string) {
  return request<void>(`/api/products/${id}`, {
    method: 'DELETE',
  })
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
  return request<ProductResponse[]>(url)
}

export function resetDatabase() {
  return request<void>('/api/test/reset', {
    method: 'POST',
  })
}
