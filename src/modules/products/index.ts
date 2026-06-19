import { CreateProductUseCase } from "./application/CreateProductUseCase";
import { GetAllProductsUseCase } from "./application/GetAllProductsUseCase";
import { GetProductByIdUseCase } from "./application/GetProductByIdUseCase";
import { IProductRepository } from "./domain/IProductRepository";
import { InMemoryProductRepository } from "./infrastructure/InMemoryProductRepository";
import { createProductRoutes } from "./presentation/ProductRoutes";

export interface ProductModuleConfig {
  productRepository?: IProductRepository;
}

export function createProductModule(config: ProductModuleConfig = {}) {
  const productRepository = config.productRepository ?? new InMemoryProductRepository();
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);
  const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
  const productRoutes = createProductRoutes({
    createProductUseCase,
    getAllProductsUseCase,
    getProductByIdUseCase,
  });

  return {
    productRoutes,
    createProductUseCase,
    getAllProductsUseCase,
    getProductByIdUseCase,
  };
}
