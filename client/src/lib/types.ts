export type AdjustmentType = 'fixed' | 'dynamic'
export type IncrementType = 'increase' | 'decrease'
export enum SelectionType {
  ALL = 'all',
  MULTIPLE = 'multiple',
  ONE = 'one',
}

export interface ProductAdjustment {
  productId: string
  adjustmentValue: number
}
