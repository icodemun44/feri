# Feri Nepal

A peer-to-peer thrift marketplace for Nepal. Buyers shop pre-loved clothes, watches, bags and tech; anyone can apply to become a seller, and our team verifies every seller by phone before they can list. Payment is cash on delivery.

> "Feri" means "again" in Nepali. Short name and handle: **Ferinep**.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 and Supabase, in a pnpm and Turborepo workspace.

## What works today

- Sign up, log in and log out (Supabase Auth)
- Role-based access: buyer, seller and admin, enforced in routes, pages and services
- Storefront: home page with a rotating banner carousel, categories, product list with search, filters and pagination, product detail
- Seller onboarding: apply, status page, admin review queue with phone-call notes, approve or reject, audit log
- Seller dashboard and admin overview

Listings, cart, checkout and orders are the next phases (see `docs/IMPLEMENTATION_PLAN.md`).

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 11 (`npm install --global pnpm@11.9.0`)
- Docker Desktop (runs the local Supabase stack)

## Quick start

```bash
pnpm install
cp .env.example .env

pnpm supabase:start
pnpm supabase:status
```

Copy the **Publishable key** and **Secret key** from the status output into `.env` as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. The URLs in `.env.example` already match the local stack.

```bash
pnpm db:deploy
pnpm db:seed
pnpm demo:seed
pnpm dev
```

Open http://localhost:3000. Demo accounts (password `Password123!`):

| Account          | Role   |
| ---------------- | ------ |
| admin@feri.test  | Admin  |
| seller@feri.test | Seller |
| buyer@feri.test  | Buyer  |

Sign up with any other email to get a fresh buyer account and try the seller application flow. Local emails are caught at http://127.0.0.1:54324.

To create your own admin: `pnpm admin:create -- --email you@example.com --password 'a-strong-password' --name 'Your Name'`.

## Scripts

| Command                          | What it does                                          |
| -------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                       | Start the web app                                     |
| `pnpm build`                     | Production build of everything                        |
| `pnpm check`                     | Format check, lint, design rules and typecheck        |
| `pnpm format`                    | Format all files with Prettier                        |
| `pnpm db:migrate --name <name>`  | Create and apply a migration (development)            |
| `pnpm db:deploy`                 | Apply pending migrations                              |
| `pnpm db:reset`                  | Reset the local database (then run the seeds)         |
| `pnpm db:studio`                 | Open Prisma Studio                                    |
| `pnpm supabase:start` / `stop`   | Start or stop the local Supabase stack                |
| `pnpm docker:up` / `docker:down` | Run the app as a container (applies migrations first) |

Supabase Studio: http://127.0.0.1:54323

## Project structure

```
apps/web            Next.js app (routes in src/app, business logic in src/modules)
packages/database   Prisma schema, migrations, client, seed
packages/shared     Roles, permissions, status rules, money, pagination
packages/validation Zod schemas
packages/ui         Design tokens and UI components
supabase            Local Supabase configuration
docs                Product and engineering documentation
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Architecture](docs/architecture.md)
- [Database and migrations](docs/database.md)
- [Role-based access control](docs/rbac.md)
- [Design system](docs/design-system.md)
- [Team contribution plan](docs/CONTRIBUTION_PLAN.md)
- [Getting started for teammates (no terminal needed)](docs/GETTING_STARTED.md)

Every folder in `apps/web/src/modules` has its own `README.md` explaining its purpose and flow.

## Conventions

- **Commits:** Conventional Commits (`feat(seller): add listing form`). A commit-msg hook checks the format.
- **Branches:** `<type>/<short-description>`, for example `feat/seller-listings`. Open a pull request; do not commit straight to `main`.
- **Code style:** descriptive names, small files, no clever tricks. Prettier and ESLint run on commit.
- **Design rules:** no gradients, no emoji, Lucide icons only (`pnpm check:design`).
- **Database:** never edit a merged migration; see `docs/database.md`.

## Troubleshooting

- **Port 3000 is busy:** run `PORT=3100 pnpm dev` (and set `NEXT_PUBLIC_SITE_URL` to match).
- **"Invalid environment configuration":** check that `.env` exists at the repository root and has the two Supabase keys.
- **Database connection refused:** make sure `pnpm supabase:start` finished and Docker is running.
