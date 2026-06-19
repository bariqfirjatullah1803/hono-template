import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, right } from "@/shared/domain/Result";
import { IProductRepository } from "@/modules/products/domain/IProductRepository";
import { Product } from "@/modules/products/domain/Product";

export type GetAllProductsResponse = Either<string, Result<Product[]>>;

export class GetAllProductsUseCase implements UseCase<void, GetAllProductsResponse> {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(): Promise<GetAllProductsResponse> {
    const products = await this.productRepository.findAll();
    return right(Result.ok<Product[]>(products));
  }
}
