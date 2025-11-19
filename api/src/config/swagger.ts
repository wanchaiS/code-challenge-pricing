import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

// Create OpenAPI registry
export const registry = new OpenAPIRegistry();

// Register schemas (they will be auto-registered when used in routes,
// but we can also register them explicitly for reusability)
import {
  brandDtoSchema,
  categoryDtoSchema,
  errorSchema,
  productDtoSchema,
  segmentDtoSchema,
  subCategoryDtoSchema,
} from '../products/schemas/product.schema.js';

// Register shared schemas
registry.register('Brand', brandDtoSchema);
registry.register('Category', categoryDtoSchema);
registry.register('SubCategory', subCategoryDtoSchema);
registry.register('Segment', segmentDtoSchema);
registry.register('ProductDto', productDtoSchema);
registry.register('Error', errorSchema);

/**
 * Generate OpenAPI specification
 * This function is called after all routes have been registered
 */
export function generateSwaggerSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'FOBOH Pricing Module API',
      version: '1.0.0',
      description: 'API for managing pricing profiles and product pricing for suppliers',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  });
}
