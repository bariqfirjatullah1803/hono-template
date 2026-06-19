import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CreateProductUseCase } from "@/modules/products/application/CreateProductUseCase";
import { GetAllProductsUseCase } from "@/modules/products/application/GetAllProductsUseCase";
import { GetProductByIdUseCase } from "@/modules/products/application/GetProductByIdUseCase";

export interface ProductRoutesDependencies {
  createProductUseCase: CreateProductUseCase;
  getAllProductsUseCase: GetAllProductsUseCase;
  getProductByIdUseCase: GetProductByIdUseCase;
}

export function createProductRoutes(deps: ProductRoutesDependencies): OpenAPIHono {
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

  const ErrorResponseSchema = z.object({
    error: z.string().openapi({ example: "Invalid input or product not found" }),
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
            schema: ErrorResponseSchema,
          },
        },
        description: "Error",
      },
    },
  });

  const getAllProductsRoute = createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(ProductResponseSchema),
          },
        },
        description: "List of products",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Error",
      },
    },
  });

  const getProductByIdRoute = createRoute({
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.string().openapi({ example: "p-123" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ProductResponseSchema,
          },
        },
        description: "Product found",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Product not found",
      },
    },
  });

  productRoutes.openapi(createProductRoute, async (c) => {
    const body = c.req.valid("json");
    const result = await deps.createProductUseCase.execute(body);

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

  productRoutes.openapi(getAllProductsRoute, async (c) => {
    const result = await deps.getAllProductsUseCase.execute();

    if (result.isLeft()) {
      return c.json({ error: result.value }, 400);
    }

    const products = result.value.getValue();

    return c.json(
      products.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        sku: product.sku,
        price: {
          amount: product.price.amount,
          currency: product.price.currency,
        },
        stock: product.stock,
      })),
      200
    );
  });

  productRoutes.openapi(getProductByIdRoute, async (c) => {
    const { id } = c.req.valid("param");

    const result = await deps.getProductByIdUseCase.execute({ id });

    if (result.isLeft()) {
      return c.json({ error: result.value }, 404);
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
    }, 200);
  });

  return productRoutes;
}
