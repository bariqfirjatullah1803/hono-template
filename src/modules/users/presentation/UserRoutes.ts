import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CreateUserUseCase } from "@/modules/users/application/CreateUserUseCase";
import { GetAllUsersUseCase } from "@/modules/users/application/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "@/modules/users/application/GetUserByIdUseCase";

export interface UserRoutesDependencies {
  createUserUseCase: CreateUserUseCase;
  getAllUsersUseCase: GetAllUsersUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
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

  const getAllUsersRoute = createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(UserResponseSchema),
          },
        },
        description: "List of users",
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

  const getUserByIdRoute = createRoute({
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.string().openapi({ example: "abc123xyz" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: UserResponseSchema,
          },
        },
        description: "User found",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "User not found",
      },
    },
  });

  // Implement the route handlers
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

  userRoutes.openapi(getAllUsersRoute, async (c) => {
    const result = await deps.getAllUsersUseCase.execute();

    if (result.isLeft()) {
      return c.json({ error: result.value }, 400);
    }

    const users = result.value.getValue();

    return c.json(
      users.map((user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      })),
      200
    );
  });

  userRoutes.openapi(getUserByIdRoute, async (c) => {
    const { id } = c.req.valid("param");

    const result = await deps.getUserByIdUseCase.execute({ id });

    if (result.isLeft()) {
      return c.json({ error: result.value }, 404);
    }

    const user = result.value.getValue();

    return c.json(
      {
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      },
      200
    );
  });

  return userRoutes;
}
