import type { Brand, Category, Segment, SubCategory } from '../products/models/references.model.js';
import type { Product } from '../products/models/product.model.js';
import type { User } from './types.js';

const userId = 'user-1' // Our sample user
const orgId = 'org-1' // Our sample organization
    
// User seed
export const seedUser: User = {
  _id: userId,
  orgId: orgId,
  createdAt: new Date(),
  email: 'supplier@foboh.com',
  name: 'Ekemini Mark',
  updatedAt: new Date(),
}

// Reference data seeds (multi-tenant - all belong to user-1)
export const seedCategories: Category[] = [
  {
    _id: 'cat-1',
    name: 'Alcoholic Beverage',
    orgId,
  },
]

export const seedSubCategories: SubCategory[] = [
  {
    _id: 'subcat-1',
    categoryId: 'cat-1',
    name: 'Wine',
    orgId,
  },
  {
    _id: 'subcat-2',
    categoryId: 'cat-1',
    name: 'Beer',
    orgId,
  },
  {
    _id: 'subcat-3',
    categoryId: 'cat-1',
    name: 'Liquor & Spirits',
    orgId,
  },
  {
    _id: 'subcat-4',
    categoryId: 'cat-1',
    name: 'Cider',
    orgId,
  },
  {
    _id: 'subcat-5',
    categoryId: 'cat-1',
    name: 'Premixed & Ready-to-Drink',
    orgId,
  },
  {
    _id: 'subcat-6',
    categoryId: 'cat-1',
    name: 'Other',
    orgId,
  },
]

export const seedSegments: Segment[] = [
  {
    _id: 'seg-1',
    name: 'Red',
    orgId,
  },
  {
    _id: 'seg-2',
    name: 'White',
    orgId,
  },
  {
    _id: 'seg-3',
    name: 'Rose',
    orgId,
  },
  {
    _id: 'seg-4',
    name: 'Orange',
    orgId,
  },
  {
    _id: 'seg-5',
    name: 'Sparkling',
    orgId,
  },
  {
    _id: 'seg-6',
    name: 'Port/Dessert',
    orgId,
  },
]

export const seedBrands: Brand[] = [
  {
    _id: 'brand-1',
    name: 'High Garden',
    orgId,
  },
  {
    _id: 'brand-2',
    name: 'Koyama Wines',
    orgId,
  },
  {
    _id: 'brand-3',
    name: 'Lacourte-Godbillon',
    orgId,
  },
]

// Products with reference IDs
export const seedProducts: Product[] = [
  {
    _id: 'prod-1',
    brandId: 'brand-1', // High Garden
    categoryId: 'cat-1', // Alcoholic Beverage
    globalWholesalePrice: 279.06,
    segmentId: 'seg-1', // Red
    skuCode: 'HGVPIN216',
    subCategoryId: 'subcat-1', // Wine
    title: 'High Garden Pinot Noir 2021',
    orgId,
  },
  {
    _id: 'prod-2',
    brandId: 'brand-2', // Koyama Wines
    categoryId: 'cat-1',
    globalWholesalePrice: 120.0,
    segmentId: 'seg-5', // Sparkling
    skuCode: 'KOYBRUNV6',
    subCategoryId: 'subcat-1', // Wine
    title: 'Koyama Methode Brut Nature NV',
    orgId,
  },
  {
    _id: 'prod-3',
    brandId: 'brand-2', // Koyama Wines
    categoryId: 'cat-1',
    globalWholesalePrice: 215.04,
    segmentId: 'seg-6', // Port/Dessert
    skuCode: 'KOYNR1837',
    subCategoryId: 'subcat-1', // Wine
    title: 'Koyama Riesling 2018',
    orgId,
  },
  {
    _id: 'prod-4',
    brandId: 'brand-2', // Koyama Wines
    categoryId: 'cat-1',
    globalWholesalePrice: 215.04,
    segmentId: 'seg-2', // White
    skuCode: 'KOYRIE19',
    subCategoryId: 'subcat-1', // Wine
    title: 'Koyama Tussock Riesling 2019',
    orgId,
  },
  {
    _id: 'prod-5',
    brandId: 'brand-3', // Lacourte-Godbillon
    categoryId: 'cat-1',
    globalWholesalePrice: 409.32,
    segmentId: 'seg-5', // Sparkling
    skuCode: 'LACBNATNV6',
    subCategoryId: 'subcat-1', // Wine
    title: 'Lacourte-Godbillon Brut Cru NV',
    orgId,
  },
]
