# Project Instructional Context: Hono Monolith DDD Template

This file serves as the foundational mandate and operational guide for all future AI agent interactions in this workspace. It takes absolute precedence over general defaults.

## 🛠️ Project Overview
This project is a production-ready **Modular Monolith Backend Template** built using **Hono** and optimized for **Cloudflare Workers** or **Bun**. It strictly enforces **Domain-Driven Design (DDD)** principles to ensure high cohesion, loose coupling, and a flawless, straightforward path to future **Microservices** migration.

### Core Stack
- **Runtime:** Cloudflare Workers / Bun
- **Framework:** [Hono Framework](https://hono.dev/)
- **Validation & OpenAPI Documentation:** `@hono/zod-openapi` + `zod`
- **Language:** TypeScript

---

## 📐 Architectural Architecture & Boundary Guidelines

The application is split into two major high-level directories: `src/shared/` and `src/modules/`. Every module represents an independent **Bounded Context**.

### 1. The Strict Dependency Rule
**Layer inner circles MUST NOT know anything about outer circles.** No imports from outer layers into inner layers are allowed.

```text
Outer Layer ──> [ Presentation ] (HTTP Routing, Request Validation)
                      │
                      ▼
                [ Infrastructure ] (Database Adapters, Remote API Clients)
                      │
                      ▼
                [ Application ] (Orchestration, Use Cases)
                      │
                      ▼
Inner Layer ──> [ Domain ] (Entities, Value Objects, Repository Contracts)
```

### 2. Folder Boundaries per Bounded Context
Each folder under `src/modules/[context_name]/` must strictly follow these rules:

- **`domain/` (Layer 1 - Core Business Rules):**
  - Contains entities extending `Entity<T>`, value objects extending `ValueObject<T>`, and repository abstractions/interfaces (e.g., `IUserRepository.ts`).
  - **CRITICAL:** Zero external tool or outer layer dependencies (no Hono, no database clients/drivers like Prisma or D1, no environment wrappers).
- **`application/` (Layer 2 - Use Cases):**
  - Contains orchestrator classes implementing `UseCase<IRequest, IResponse>`.
  - Communicates only via domain primitives and domain contracts (repositories). Mapped strictly with functional error routing (`Either<L, R>`).
- **`infrastructure/` (Layer 3 - Technical Adapters):**
  - Implements the contracts defined in the domain layer (e.g., `InMemoryUserRepository.ts` or actual SQL query logic).
- **`presentation/` (Layer 4 - Web & Interface Controllers):**
  - Implements Hono routes using `OpenAPIHono` and `createRoute`. Defines input validation and Swagger responses using type-safe Zod models.

---

## 🚀 Key Commands (Building, Running, Testing)

Derived from `package.json` and Cloudflare Wrangler layout:

- **Install Dependencies:**
  ```bash
  bun install  # or npm install
  ```
- **Local Development Server:**
  ```bash
  bun run dev  # runs wrangler dev
  ```
- **Cloudflare Workers Deployment:**
  ```bash
  bun run deploy  # runs wrangler deploy --minify
  ```
- **Generate Cloudflare Bindings Types:**
  ```bash
  bun run cf-typegen  # runs wrangler types --env-interface CloudflareBindings
  ```

---

## 🧠 Development Conventions & Design Patterns

Future agents or engineers working on this codebase must rigorously adhere to these established conventions:

1. **Functional Error Handling Over Exceptions:**
   - Never throw raw errors or bubble exceptions for expected business failures (e.g., validation failed, email already exists).
   - Use the `Result` and `Either` wrappers inside `src/shared/domain/Result.ts`. 
   - Use `left(errorValue)` to represent application errors, and `right(Result.ok(successValue))` to represent success paths.

2. **Entity Creation Safety:**
   - Keep Constructors of Entities and Value Objects `private`.
   - Expose a `public static create(...): Result<Entity>` factory method to validate properties *before* instantiating objects, ensuring the entity is never in an invalid state.

3. **No Cross-Module Database Joins:**
   - To keep modules easily detachable for future microservices, modules must **NEVER** query or join data directly from another module's database tables or repositories. Communication across modules must happen strictly via application-level service calls or domain events.

4. **Self-Documenting Web Architecture:**
   - Every endpoint must be built using `@hono/zod-openapi`'s `createRoute` to ensure that parameters, headers, bodies, and responses are completely typed and auto-reflected into the `/doc` OpenAPI document client.
