import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { notFound } from 'src/common/exceptions/api.exception';
import { Product } from 'src/shared/models';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductReferencesDto } from '../dto/product-references.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SearchFilters } from '../dto/search-filters';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductRepository } from '../repositories/product.repository';
import { ReferenceRepository } from '../repositories/reference.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly referenceRepository: ReferenceRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  getProducts(orgId: string): ProductResponseDto[] {
    const products = this.productRepository.findByOrgId(orgId);
    const lookups = this.buildReferenceLookups(orgId);
    return products.map((product) => this.mapProduct(product, lookups));
  }

  getProductById(id: string, orgId: string): ProductResponseDto {
    const product = this.ensureProductForOrg(id, orgId);
    const lookups = this.buildReferenceLookups(orgId);
    return this.mapProduct(product, lookups);
  }

  searchProducts(orgId: string, filters: SearchFilters): ProductResponseDto[] {
    const hasFilters =
      Boolean(filters.search && filters.search.trim().length >= 2) ||
      Boolean(filters.brandId) ||
      Boolean(filters.categoryId) ||
      Boolean(filters.segmentId) ||
      Boolean(filters.subCategoryId);

    if (!hasFilters) {
      return [];
    }

    const products = this.productRepository.search(orgId, filters);
    const lookups = this.buildReferenceLookups(orgId);
    return products.map((product) => this.mapProduct(product, lookups));
  }

  createProduct(orgId: string, dto: CreateProductDto): ProductResponseDto {
    const product: Product = {
      _id: randomUUID(),
      orgId,
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      globalWholesalePrice: dto.globalWholesalePrice,
      segmentId: dto.segmentId,
      skuCode: dto.skuCode,
      subCategoryId: dto.subCategoryId,
      title: dto.title,
      styleId: dto.styleId ?? undefined,
    };

    const created = this.productRepository.create(product);
    const lookups = this.buildReferenceLookups(orgId);
    return this.mapProduct(created, lookups);
  }

  updateProduct(
    id: string,
    orgId: string,
    dto: UpdateProductDto,
  ): ProductResponseDto {
    const existing = this.ensureProductForOrg(id, orgId);

    const { styleId, ...rest } = dto;
    const normalizedUpdates: Partial<Product> = { ...rest } as Partial<Product>;
    if ('styleId' in dto) {
      normalizedUpdates.styleId = styleId ?? undefined;
    }

    const updated = this.productRepository.update(
      existing._id,
      normalizedUpdates,
    );
    if (!updated) {
      throw notFound('Product');
    }

    const lookups = this.buildReferenceLookups(orgId);
    return this.mapProduct(updated, lookups);
  }

  deleteProduct(id: string, orgId: string): void {
    const existing = this.ensureProductForOrg(id, orgId);
    const deleted = this.productRepository.delete(existing._id);
    if (!deleted) {
      throw notFound('Product');
    }
  }

  getReferences(orgId: string): ProductReferencesDto {
    const categories = this.referenceRepository.getCategories(orgId);
    const subCategories = this.referenceRepository.getSubCategories(orgId);
    const segments = this.referenceRepository.getSegments(orgId);
    const brands = this.referenceRepository.getBrands(orgId);
    const styles = this.referenceRepository.getStyles(orgId);

    return {
      categories: categories.map(({ _id, name }) => ({ _id, name })),
      subCategories: subCategories.map(({ _id, name, categoryId }) => ({
        _id,
        name,
        categoryId,
      })),
      segments: segments.map(({ _id, name }) => ({ _id, name })),
      brands: brands.map(({ _id, name }) => ({ _id, name })),
      styles: styles.map(({ _id, name, subCategoryId }) => ({
        _id,
        name,
        subCategoryId,
      })),
    };
  }

  private ensureProductForOrg(id: string, orgId: string): Product {
    const product = this.productRepository.findById(id);
    if (!product || product.orgId !== orgId) {
      throw notFound('Product');
    }
    return product;
  }

  private buildReferenceLookups(orgId: string) {
    const brands = this.referenceRepository.getBrands(orgId);
    const categories = this.referenceRepository.getCategories(orgId);
    const segments = this.referenceRepository.getSegments(orgId);
    const subCategories = this.referenceRepository.getSubCategories(orgId);
    const styles = this.referenceRepository.getStyles(orgId);

    return {
      brands: new Map(brands.map((entry) => [entry._id, entry])),
      categories: new Map(categories.map((entry) => [entry._id, entry])),
      segments: new Map(segments.map((entry) => [entry._id, entry])),
      subCategories: new Map(subCategories.map((entry) => [entry._id, entry])),
      styles: new Map(styles.map((entry) => [entry._id, entry])),
    };
  }

  private mapProduct(
    product: Product,
    lookups: ReturnType<ProductsService['buildReferenceLookups']>,
  ): ProductResponseDto {
    const brand = lookups.brands.get(product.brandId);
    const category = lookups.categories.get(product.categoryId);
    const segment = lookups.segments.get(product.segmentId);
    const subCategory = lookups.subCategories.get(product.subCategoryId);
    const style = product.styleId
      ? lookups.styles.get(product.styleId)
      : undefined;

    return {
      _id: product._id,
      brand: brand ? { _id: brand._id, name: brand.name } : null,
      category: category ? { _id: category._id, name: category.name } : null,
      globalWholesalePrice: product.globalWholesalePrice,
      segment: segment ? { _id: segment._id, name: segment.name } : null,
      skuCode: product.skuCode,
      subCategory: subCategory
        ? {
            _id: subCategory._id,
            name: subCategory.name,
            categoryId: subCategory.categoryId,
          }
        : null,
      style: style
        ? {
            _id: style._id,
            name: style.name,
            subCategoryId: style.subCategoryId,
          }
        : null,
      title: product.title,
    };
  }
}
