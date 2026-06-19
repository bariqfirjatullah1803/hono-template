import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CreateUserUseCase } from "@/modules/users/application/CreateUserUseCase";

export interface UserRoutesDependencies {
  createUserUseCase: CreateUserUseCase;
}

export function createUserRoutes(deps: UserRoutesDependencies): OpenAPIHono {
  const userRoutes = new OpenAPIHono();

  // Define Zod schemas for OpenAPI documentation
  const CreateUserSchema = z.object({
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
  });

  const UserResponseSchema = z.object({
    id: z.string().openapi({ example: "abc123xyz" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().openapi({ example: "john@example.com" }),
  });

  const ErrorResponseSchema = z.object({
    error: z.string().openapi({ example: "Invalid input or user already exists" }),
  });

  // Define the route metadata
  const createUserRoute = createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateUserSchema,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: UserResponseSchema,
          },
        },
        description: "User created successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad Request / Validation Error",
      },
    },
  });

  // Implement the route handler
  userRoutes.openapi(createUserRoute, async (c) => {
    const body = c.req.valid("json");

    const result = await deps.createUserUseCase.execute({
      name: body.name,
      email: body.email,
    });

    if (result.isLeft()) {
      return c.json({ error: result.value }, 400);
    }

    const user = result.value.getValue();

    return c.json(
      {
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      },
      201
    );
  });

  return userRoutes;
}
