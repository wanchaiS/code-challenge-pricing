import type { PricingProfile } from '../profiles/models/profile.model.js';
import { seedBrands, seedCategories, seedProducts, seedSegments, seedStyles, seedSubCategories, seedUser } from './seed.js';
import type { User } from './types.js';

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
  styles: [...seedStyles],
}

// Helper to reset database
export const resetDb = (): void => {
  db.users = [seedUser]
  db.categories = [...seedCategories]
  db.subCategories = [...seedSubCategories]
  db.segments = [...seedSegments]
  db.styles = [...seedStyles]
  db.brands = [...seedBrands]
  db.products = [...seedProducts]
  db.pricingProfiles = []
}

// Get current user (since we only have one user in this challenge)
export const getCurrentUser = (): User => {
  const user = db.users[0]
  return user
}
