import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CreateProductUseCase } from "@/modules/products/application/CreateProductUseCase";
import { InMemoryProductRepository } from "@/modules/products/infrastructure/InMemoryProductRepository";

const productRepository = new InMemoryProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);

const productRoutes = new OpenAPIHono();

const CreateProductSchema = z.object({
  name: z.string().openapi({ example: "Mechanical Keyboard" }),
  sku: z.string().openapi({ example: "KB-001" }),
  priceAmount: z.number().positive().openapi({ example: 1500000 }),
  stock: z.number().int().nonnegative().openapi({ example: 50 }),
});

const ProductResponseSchema = z.object({
  id: z.string().openapi({ example: "p-123" }),
  name: z.string().openapi({ example: "Mechanical Keyboard" }),
  sku: z.string().openapi({ example: "KB-001" }),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  stock: z.number(),
});

const createProductRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ProductResponseSchema,
        },
      },
      description: "Product created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
      description: "Error",
    },
  },
});

productRoutes.openapi(createProductRoute, async (c) => {
  const body = c.req.valid("json");
  const result = await createProductUseCase.execute(body);

  if (result.isLeft()) {
    return c.json({ error: result.value }, 400);
  }

  const product = result.value.getValue();
  return c.json({
    id: product.id.toString(),
    name: product.name,
    sku: product.sku,
    price: {
      amount: product.price.amount,
      currency: product.price.currency,
    },
    stock: product.stock,
  }, 201);
});

export { productRoutes };
