import { CreateProductUseCase } from "./application/CreateProductUseCase";
import { IProductRepository } from "./domain/IProductRepository";
import { InMemoryProductRepository } from "./infrastructure/InMemoryProductRepository";
import { createProductRoutes } from "./presentation/ProductRoutes";

export interface ProductModuleConfig {
  productRepository?: IProductRepository;
}

export function createProductModule(config: ProductModuleConfig = {}) {
  const productRepository = config.productRepository ?? new InMemoryProductRepository();
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const productRoutes = createProductRoutes({ createProductUseCase });

  return {
    productRoutes,
    createProductUseCase,
  };
}
