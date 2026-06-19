import { IProductRepository } from "@/modules/products/domain/IProductRepository";
import { Product } from "@/modules/products/domain/Product";

export class InMemoryProductRepository implements IProductRepository {
  private products: Product[] = [];

  async findBySku(sku: string): Promise<Product | null> {
    const product = this.products.find(p => p.sku === sku);
    return product || null;
  }

  async save(product: Product): Promise<void> {
    const existingIndex = this.products.findIndex(p => p.sku === product.sku);
    if (existingIndex > -1) {
      this.products[existingIndex] = product;
    } else {
      this.products.push(product);
    }
  }
}
