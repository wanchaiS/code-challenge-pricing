import { Injectable } from '@nestjs/common';
import { StoreService } from 'src/shared/store.service';

@Injectable()
export class ReferenceRepository {
  constructor(private readonly store: StoreService) {}

  getBrands(orgId: string) {
    return this.store.getBrands().filter((b) => b.orgId === orgId);
  }

  findBrandById(id: string) {
    return this.store.getBrands().find((b) => b._id === id);
  }

  getCategories(orgId: string) {
    return this.store.getCategories().filter((c) => c.orgId === orgId);
  }

  findCategoryById(id: string) {
    return this.store.getCategories().find((c) => c._id === id);
  }

  getSubCategories(orgId: string) {
    return this.store.getSubCategories().filter((sc) => sc.orgId === orgId);
  }

  findSubCategoryById(id: string) {
    return this.store.getSubCategories().find((sc) => sc._id === id);
  }

  findSubCategoriesByCategoryId(categoryId: string) {
    return this.store
      .getSubCategories()
      .filter((sc) => sc.categoryId === categoryId);
  }

  getSegments(orgId: string) {
    return this.store.getSegments().filter((s) => s.orgId === orgId);
  }

  findSegmentById(id: string) {
    return this.store.getSegments().find((s) => s._id === id);
  }

  getStyles(orgId: string) {
    return this.store.getStyles().filter((s) => s.orgId === orgId);
  }

  findStyleById(id: string) {
    return this.store.getStyles().find((s) => s._id === id);
  }

  findStylesBySubCategoryId(subCategoryId: string) {
    return this.store
      .getStyles()
      .filter((s) => s.subCategoryId === subCategoryId);
  }
}
