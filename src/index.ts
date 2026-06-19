import { OpenAPIHono } from "@hono/zod-openapi";
import { userRoutes } from "@/modules/users/presentation/UserRoutes";
import { productRoutes } from "@/modules/products/presentation/ProductRoutes";
import { loggerMiddleware } from "@/shared/presentation/LoggerMiddleware";

const app = new OpenAPIHono();

// Inject global shared presentation middleware
app.use("*", loggerMiddleware);

// Global health check route
app.get("/", (c) => {
  return c.text("Hono DDD Template API is running!");
});

// Mount modular Bounded Contexts
app.route("/users", userRoutes);
app.route("/products", productRoutes);

// OpenAPI Documentation configuration
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono Monolith DDD Template API",
    description: "A production-ready Modular Monolith API template using Domain-Driven Design (DDD) with Hono.",
  },
});

export default app;
