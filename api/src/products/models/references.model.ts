/**
 * Reference data models for products
 */

export interface Brand {
  _id: string;
  name: string;
  orgId: string;
}

export interface Category {
  _id: string;
  name: string;
  orgId: string;
}

export interface SubCategory {
  _id: string;
  categoryId: string;
  name: string;
  orgId: string;
}

export interface Segment {
  _id: string;
  name: string;
  orgId: string;
}
