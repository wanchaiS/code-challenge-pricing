// Enums (system behavior only)
export enum AdjustmentType {
  DYNAMIC = 'dynamic',
  FIXED = 'fixed',
}

export enum IncrementType {
  DECREASE = 'decrease',
  INCREASE = 'increase',
}

// ============== Core entities =================
export interface User {
  _id: string
  orgId: string
  createdAt: Date
  email: string
  name: string
  updatedAt: Date
}

export interface Product {
  _id: string
  brandId: string
  categoryId: string 
  globalWholesalePrice: number
  segmentId: string 
  skuCode: string
  subCategoryId: string 
  title: string
  orgId: string 
  
}

export interface PricingProfile {
  _id: string
  adjustmentType: AdjustmentType
  basedOn: string | null // another profile ID, if null means global wholesale price
  incrementType: IncrementType
  name: string
  productAdjustments: ProductAdjustment[]
  createdAt: Date
  updatedAt: Date
  orgId: string
}

interface ProductAdjustment {
  adjustmentValue: number
  productId: string
}

// Reference data
export interface Category {
  _id: string
  name: string
  orgId: string 
}

export interface SubCategory {
  _id: string
  categoryId: string 
  name: string
  orgId: string 
}

export interface Segment {
  _id: string
  name: string
  orgId: string 
}

export interface Brand {
  _id: string
  name: string
  orgId: string 
}

// =============== DTOs view models  (for API responses) =================

// Products
export interface ProductDto {
  _id: string
  brand: Brand
  category: Category
  globalWholesalePrice: number
  segment: Segment
  skuCode: string
  subCategory: SubCategory
  title: string
  orgId: string
}

export interface CreateProductDto {
  brandId: string
  categoryId: string
  globalWholesalePrice: number
  segmentId: string
  skuCode: string
  subCategoryId: string
  title: string
}

export interface UpdateProductDto {
  brandId?: string
  categoryId?: string
  globalWholesalePrice?: number
  segmentId?: string
  skuCode?: string
  subCategoryId?: string
  title?: string
}

// Pricing Profiles
export interface PriceProfileDto {
  _id: string
  adjustmentType: AdjustmentType
  basedOn: string | null
  incrementType: IncrementType
  name: string
  productAdjustments: ProductAdjustmentDto[]
  createdAt: Date
  updatedAt: Date
  orgId: string
}

interface ProductAdjustmentDto {
  adjustmentValue: number
  productId: string
  title: string
  skuCode: string
  basedOnPrice: number
  newPrice: number
}

export interface CreatePricingProfileDto {
  name: string
}

export interface UpdatePricingProfileDto {
  adjustmentType?: AdjustmentType
  basedOn?: string
  incrementType?: IncrementType
  name?: string
  productAdjustments?: ProductAdjustment[]
}


// =============== Filters and detailed views =================
export interface ProductFilter {
  brandId?: string
  search?: string
  segmentId?: string
  subCategoryId?: string
}

