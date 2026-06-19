import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, left, right } from "@/shared/domain/Result";
import { IProductRepository } from "@/modules/products/domain/IProductRepository";
import { Product } from "@/modules/products/domain/Product";

export interface GetProductByIdDTO {
  id: string;
}

export type GetProductByIdResponse = Either<string, Result<Product>>;

export class GetProductByIdUseCase implements UseCase<GetProductByIdDTO, GetProductByIdResponse> {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(request: GetProductByIdDTO): Promise<GetProductByIdResponse> {
    const product = await this.productRepository.findById(request.id);

    if (!product) {
      return left("Product not found");
    }

    return right(Result.ok<Product>(product));
  }
}
