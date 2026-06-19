import { Entity } from "@/shared/domain/Entity";
import { UniqueEntityID } from "@/shared/domain/UniqueEntityID";
import { Result } from "@/shared/domain/Result";
import { ProductPrice } from "./ProductPrice";

interface ProductProps {
  name: string;
  sku: string;
  price: ProductPrice;
  stock: number;
}

export class Product extends Entity<ProductProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): string {
    return this.props.sku;
  }

  get price(): ProductPrice {
    return this.props.price;
  }

  get stock(): number {
    return this.props.stock;
  }

  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public reduceStock(quantity: number): Result<void> {
    if (this.props.stock < quantity) {
      return Result.fail<void>("Insufficient stock available");
    }
    this.props.stock -= quantity;
    return Result.ok<void>();
  }

  public static create(props: ProductProps, id?: UniqueEntityID): Result<Product> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Product>("Product name is required");
    }
    if (!props.sku || props.sku.trim().length === 0) {
      return Result.fail<Product>("Product SKU is required");
    }
    if (props.stock < 0) {
      return Result.fail<Product>("Initial stock cannot be negative");
    }
    
    return Result.ok<Product>(new Product(props, id));
  }
}
