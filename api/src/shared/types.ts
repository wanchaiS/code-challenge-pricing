/**
 * Shared types and enums used across multiple modules
 */

// ============== Enums (Shared Constants) =================

export enum AdjustmentType {
  DYNAMIC = 'dynamic',
  FIXED = 'fixed',
}

export enum IncrementType {
  DECREASE = 'decrease',
  INCREASE = 'increase',
}

export enum SelectionType {
  ALL = 'all',
  MULTIPLE = 'multiple',
  ONE = 'one',
}

// ============== Shared Domain Models =================

export interface User {
  _id: string;
  orgId: string;
  createdAt: Date;
  email: string;
  name: string;
  updatedAt: Date;
}
