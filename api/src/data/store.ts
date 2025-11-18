import type { PricingProfile, User } from '../types/index.js'
import { seedBrands, seedCategories, seedProducts, seedSegments, seedSubCategories, seedUser } from './seed.js'

// In-memory database simulating MongoDB collections
export const db = {
  // Core entities
  pricingProfiles: [] as PricingProfile[],
  products: [...seedProducts],
  users: [seedUser],
  // Reference data
  brands: [...seedBrands],
  categories: [...seedCategories],
  subCategories: [...seedSubCategories],
  segments: [...seedSegments],
}

// Helper to reset database
export const resetDb = (): void => {
  db.users = [seedUser]
  db.categories = [...seedCategories]
  db.subCategories = [...seedSubCategories]
  db.segments = [...seedSegments]
  db.brands = [...seedBrands]
  db.products = [...seedProducts]
  db.pricingProfiles = []
}

// Get current user (since we only have one user in this challenge)
export const getCurrentUser = (): User => {
  const user = db.users[0]
  if (!user) {
    throw new Error('No user found')
  }
  return user
}
