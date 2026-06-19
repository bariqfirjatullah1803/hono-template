import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, left, right } from "@/shared/domain/Result";
import { IProductRepository } from "@/modules/products/domain/IProductRepository";
import { Product } from "@/modules/products/domain/Product";
import { ProductPrice } from "@/modules/products/domain/ProductPrice";

export interface CreateProductDTO {
  name: string;
  sku: string;
  priceAmount: number;
  stock: number;
}

export type CreateProductResponse = Either<string, Result<Product>>;

export class CreateProductUseCase implements UseCase<CreateProductDTO, CreateProductResponse> {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(request: CreateProductDTO): Promise<CreateProductResponse> {
    const priceOrError = ProductPrice.create(request.priceAmount);
    if (priceOrError.isFailure) {
      return left(priceOrError.errorValue());
    }

    try {
      const productExists = await this.productRepository.findBySku(request.sku);
      if (productExists) {
        return left(`Product with SKU ${request.sku} already exists`);
      }

      const productOrError = Product.create({
        name: request.name,
        sku: request.sku,
        price: priceOrError.getValue(),
        stock: request.stock
      });

      if (productOrError.isFailure) {
        return left(productOrError.errorValue());
      }

      const product = productOrError.getValue();
      await this.productRepository.save(product);

      return right(Result.ok<Product>(product));
    } catch (err: any) {
      return left(err.message || "An unexpected error occurred");
    }
  }
}
