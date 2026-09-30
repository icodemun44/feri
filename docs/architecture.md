# Architecture

Feri Nepal is a **modular monolith**: one deployable Next.js application with clear internal layers, plus shared packages for code that is reused or must stay framework-free.

## Layers

```
Route (src/app)            pages and route handlers: read the request, call a service, render
   |
Server action (*.actions)  validate input (Zod), check the signed-in user, call a service
   |
Service (*.service)        business rules, permission checks, transactions, audit entries
   |
Repository (*.repository)  the only place that talks to Prisma for that module
   |
Database (Postgres)
```

Rules:

- Pages never call Prisma. They call a service (or a repository for trivial reads).
- A service never imports from `src/app`.
- Permission checks live in services (`assertPermission`), so they apply no matter who calls the service.
- Repositories accept an optional `db` argument so a service can run several of them inside one transaction (`withTransaction`).
- A module may use another module's service or repository, but not its components.

## Packages

| Package            | Contains                                                                                                     | Depends on           |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------- |
| `@feri/shared`     | Roles, permissions, route access rules, status transitions, money, pagination, error and action-result types | nothing              |
| `@feri/validation` | Zod schemas for auth, seller applications and catalog queries                                                | shared               |
| `@feri/database`   | Prisma schema, migrations, client, seed                                                                      | shared (type checks) |
| `@feri/ui`         | Design tokens (CSS) and UI components                                                                        | nothing              |
| `@feri/web`        | The application                                                                                              | all of the above     |

Packages are consumed as TypeScript source (no separate build step). `@feri/shared` and `@feri/ui` never import from the app.

## Folder map of `apps/web/src`

- `app/` - routes grouped by audience: `(storefront)`, `(auth)`, `(seller)`, `(admin)`.
- `modules/` - `auth`, `users`, `sellers`, `seller-applications`, `catalog`, `banners`, `audit`. Each has a `README.md` with its purpose, structure, user and technical flow, and any non-obvious rationale.
- `server/` - `env.ts` (validated environment), `logger.ts`, `supabase/` (server client), `auth/` (session, guards, `assert-permission`), `actions/` (`runAction`, `parseFormData`).
- `components/` - `layout/` (header, footer, dashboard shell, pagination) and `forms/` (submit button, messages).
- `lib/` - small framework-free helpers (formatting, safe redirects).
- `proxy.ts` - refreshes the Supabase session on every request and redirects anonymous visitors away from protected routes.

## Server actions

Every action follows the same shape:

```
runAction(async () => {
  const user = await assertActionPermission(PERMISSIONS.X);
  const input = parseFormData(schema, formData);
  await someService.doThing(user, input);
  revalidatePath(...);
})
```

`runAction` turns a thrown `AppError` into a typed `ActionResult` (with field errors for forms) and turns any unexpected error into a generic message after logging the details. Redirects pass through untouched. Forms render the result with `useActionState`.

## Environment

All configuration comes from environment variables (see `.env.example`), validated once by `src/server/env.ts`. A single root `.env` is loaded by the `dotenv` CLI for the app, and by the Prisma config for migrations. Secrets are only read by scripts, never by request handling.

## Local services

`supabase start` runs Postgres, Auth, Storage, Studio and a mail catcher in Docker. The app runs on the host (`pnpm dev`) or as a container (`docker compose up`, which also applies migrations first).
