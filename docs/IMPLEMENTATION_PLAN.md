# Implementation Plan - Feri Nepal

Companion to `PRD.md`. This document describes the tech stack, the repository layout, and the phased build order with current status.

---

## 1. Tech stack

| Layer           | Choice                                                                     | Why                                                                         |
| --------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19                                          | One codebase for pages, server actions and route handlers                   |
| Language        | TypeScript 6 (strict)                                                      | Catches mistakes early; types shared across the whole repo                  |
| Database        | Supabase Postgres                                                          | Managed Postgres with auth and storage in one place; runs locally in Docker |
| ORM             | Prisma 7 with the `pg` driver adapter                                      | Typed queries, readable schema, safe migrations                             |
| Auth            | Supabase Auth (email and password)                                         | No hand-rolled authentication                                               |
| Storage         | Supabase Storage (`product-images` bucket)                                 | Product photos                                                              |
| Styling         | Tailwind CSS 4 with design tokens                                          | Consistent, small CSS; tokens live in one file                              |
| Icons and fonts | Lucide, Fraunces, Figtree, Noto Sans Devanagari (Fontsource)               | No emoji, self-hosted fonts, Nepali text support                            |
| Validation      | Zod                                                                        | One schema used by forms and server actions                                 |
| Monorepo        | pnpm workspaces and Turborepo                                              | Shared packages with cached tasks                                           |
| Quality         | ESLint (one root config), Prettier, Husky, commitlint, design-rules script | Consistent code and commit history                                          |
| Containers      | Docker and Docker Compose                                                  | Same app image locally and in deployment                                    |
| CI              | GitHub Actions                                                             | Migrations on a clean database, lint, typecheck, build                      |

Payments are cash on delivery only for the MVP.

---

## 2. Repository layout

```
apps/
  web/                  the Next.js application (a modular monolith)
    src/app/            routes only: (storefront), (auth), (seller), (admin)
    src/modules/        application layer, one folder per business area
    src/server/         cross-cutting server code: env, logger, auth, action helpers
    src/components/     shared UI built from @feri/ui (layout, forms)
    scripts/            admin creation and demo data scripts
packages/
  database/             Prisma schema, migrations, client, seed
  shared/               roles, permissions, status rules, money, pagination, errors
  validation/           Zod schemas used by forms and actions
  ui/                   design tokens and UI components
supabase/               local Supabase config (auth and storage only)
docs/                   product and engineering documentation
```

See `architecture.md` for the layering rules.

---

## 3. Build phases

| Phase | Scope                                                                                               | Status  |
| ----- | --------------------------------------------------------------------------------------------------- | ------- |
| 0     | Foundation: monorepo, Docker, Supabase, Prisma migrations, tooling, design system, CI               | Done    |
| 1     | Authentication and role-based access (routes, guards, permissions)                                  | Done    |
| 2     | Catalog read: categories, product list with search and filters, product detail, home page, banners  | Done    |
| 3     | Seller application workflow: apply, status, admin queue, call notes, approve and reject             | Done    |
| 4     | Seller listings: create, edit, publish, image upload to Storage                                     | Next    |
| 5     | Cart and checkout: address form, one order per seller, COD payment record                           | Planned |
| 6     | Order management: seller fulfilment, status tracking, COD collection                                | Planned |
| 7     | Reviews and seller ratings                                                                          | Planned |
| 8     | Admin tools: banner management, category management, listing moderation, user suspension, analytics | Planned |
| 9     | Polish: empty states, error pages, responsive and accessibility pass, demo data                     | Planned |
| 10    | Later: eSewa and Khalti, email notifications                                                        | Later   |

Each phase is demoable on its own.

---

## 4. How to add a feature (the standard path)

1. **Schema**: change `packages/database/prisma/schema.prisma`, run `pnpm db:migrate --name <change>`, commit the generated migration. Follow the rules in `database.md`.
2. **Rules**: if the feature adds a permission, status or shared constant, add it to `packages/shared` first.
3. **Validation**: add a Zod schema to `packages/validation`.
4. **Module**: create `apps/web/src/modules/<feature>/` with `*.repository.ts` (Prisma), `*.service.ts` (business rules and permission checks), `*.actions.ts` (server actions) and a `README.md`.
5. **UI**: build pages in `src/app` and feature components in the module's `components/`, using `@feri/ui`.
6. **Check**: `pnpm check` (format, lint, typecheck) and `pnpm build` must pass.

---

## 5. Definition of done

- Permission checks exist in the service layer, not only in the UI.
- Inputs are validated with Zod.
- Every list has an empty state; failures of non-critical data do not break the page.
- No gradients, no emoji, only Lucide icons.
- The module README is updated.
