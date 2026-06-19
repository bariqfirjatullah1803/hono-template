import { Result } from "@/shared/domain/Result";
import { ValueObject } from "@/shared/domain/ValueObject";

interface ProductPriceProps {
  amount: number;
  currency: string;
}

export class ProductPrice extends ValueObject<ProductPriceProps> {
  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  private constructor(props: ProductPriceProps) {
    super(props);
  }

  public static create(amount: number, currency: string = "IDR"): Result<ProductPrice> {
    if (amount < 0) {
      return Result.fail<ProductPrice>("Price amount cannot be negative");
    }
    return Result.ok<ProductPrice>(new ProductPrice({ amount, currency }));
  }
}
