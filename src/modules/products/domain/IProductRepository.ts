import { Product } from "./Product";

export interface IProductRepository {
  findBySku(sku: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
