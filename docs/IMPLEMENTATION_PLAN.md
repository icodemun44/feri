# Implementation Plan — Feri Nepal

Companion to `PRD.md`. Defines tech stack, architecture, schema, folder structure, and build phases.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Server components + Server Actions cut down on hand-written API boilerplate; one codebase for UI + backend. |
| Language | **TypeScript** | Type safety end-to-end, catches mistakes before runtime — important for a student team. |
| Database | **Supabase Postgres** | Managed Postgres + Auth + Storage in one place, generous free tier. |
| ORM | **Prisma** | Typed queries, readable schema file, easy migrations — easier for a team to reason about than raw SQL. |
| Auth | **Supabase Auth** | Handles email/password + phone OTP out of the box; avoid hand-rolling auth. |
| File storage | **Supabase Storage** | Product images, vendor documents. |
| Styling | **Tailwind CSS** | Fast, consistent with the design tokens in the demo; avoids a separate CSS architecture debate. |
| UI primitives | **shadcn/ui** (Radix-based) | Accessible unstyled components you own the code for — no black-box dependency. |
| Validation | **Zod** | Shared validation schemas between client forms and Server Actions. |
| Payments | **eSewa / Khalti** merchant APIs | As specified in PRD; COD as a non-gateway fallback path. |
| Hosting | **Vercel** (app) + **Supabase** (data/auth/storage) | Zero-config deploys, preview URLs per PR. |

**Deliberately excluded** to keep things simple: no separate state-management library (React state + server actions + `useOptimistic` is enough), no microservices, no GraphQL layer, no custom auth.

---

## 2. High-Level Architecture

```
Browser (Next.js App Router, React Server Components)
   │
   ├─ Server Components  → read data directly via Prisma (server-only)
   ├─ Server Actions      → mutations (create listing, apply as vendor, checkout, approve vendor…)
   │      │
   │      ├─ Zod validation
   │      ├─ Role/ownership check (session → role → allowed?)
   │      └─ Prisma write → Supabase Postgres
   │
   ├─ Supabase Auth (client + server helpers) → session/JWT, phone OTP, email/password
   └─ Supabase Storage → product images (public bucket), vendor docs (private bucket)

Payment gateways (eSewa/Khalti) ⇄ Next.js Route Handlers (webhook/callback endpoints)
```

### 2.1 Why not lean on Postgres Row-Level Security as the main gate
Supabase's default pattern is RLS policies enforced per-request via the user's JWT. That works cleanly when the **client** talks to Supabase directly. Once Prisma is introduced (talking to Postgres with a trusted server-side connection string), RLS either needs to be bypassed (service role) or re-derived per request, which adds complexity for a student team to maintain correctly.

**Decision:** All data mutations and most reads go through Next.js server code (Server Components/Actions/Route Handlers) using Prisma with a trusted connection. Authorization is enforced explicitly in application code with small reusable guard functions (`requireRole()`, `requireOwnership()`). RLS is left **on** for Supabase Storage buckets and for the `auth.users` table (Supabase-managed defaults), but the app's business tables are not accessed directly from the browser — so app-level checks are the real gate. This is simpler to read, test, and reason about than dual-layer RLS + app checks, while still being secure because nothing bypasses the server.

---

## 3. Role-Based Permissions — Implementation Approach

1. `User.role` is the source of truth: `BUYER | VENDOR | ADMIN` (Prisma enum).
2. A tiny `lib/auth/guards.ts` module exposes:
   - `getSession()` — reads the current Supabase session on the server.
   - `requireUser()` — throws/redirects if not logged in.
   - `requireRole(role: Role | Role[])` — throws/redirects if role doesn't match.
   - `requireVendorOwnership(productId)` — confirms the logged-in vendor owns the resource being mutated.
3. Route groups mirror roles for clarity:
   - `app/(shop)/...` — public + buyer routes.
   - `app/(vendor)/vendor/...` — requires `role === VENDOR` and `Vendor.status === VERIFIED`.
   - `app/(admin)/admin/...` — requires `role === ADMIN`.
4. `middleware.ts` does a **cheap** first-pass redirect (logged-out users hitting `/vendor/*` or `/admin/*` → `/login`); the **authoritative** check still happens inside each Server Action/page via the guard functions, so security never depends on middleware alone.
5. Becoming a vendor doesn't change `User.role` until Admin approval — the Vendor Application itself is just a `Vendor` row with `status = PENDING`.

This keeps permission logic in one small, readable file instead of scattered ad hoc checks — easy for teammates to find and extend.

---

## 4. Prisma Schema (draft)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  BUYER
  VENDOR
  ADMIN
}

enum VendorStatus {
  PENDING
  VERIFIED
  REJECTED
  SUSPENDED
}

enum ProductCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
}

enum ProductStatus {
  DRAFT
  ACTIVE
  SOLD
  REMOVED
  FLAGGED
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  ESEWA
  KHALTI
  COD
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model User {
  id        String   @id @default(uuid())
  authId    String   @unique // Supabase auth.users.id
  name      String
  email     String   @unique
  phone     String?
  role      Role     @default(BUYER)
  createdAt DateTime @default(now())

  profile  UserProfile?
  vendor   Vendor?
  orders   Order[]
  reviews  Review[]
}

model UserProfile {
  id           String  @id @default(uuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
  firstName    String?
  lastName     String?
  displayName  String?
  profileImage String?
  bio          String?
}

model Vendor {
  id                String       @id @default(uuid())
  userId            String       @unique
  user              User         @relation(fields: [userId], references: [id])
  businessName      String
  description       String?
  contactEmail      String
  phone             String
  status            VendorStatus @default(PENDING)
  verificationNotes String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  products Product[]
  reviews  Review[]
}

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  products    Product[]
}

model Product {
  id          String            @id @default(uuid())
  vendorId    String
  vendor      Vendor            @relation(fields: [vendorId], references: [id])
  categoryId  String
  category    Category          @relation(fields: [categoryId], references: [id])
  name        String
  description String
  price       Decimal
  condition   ProductCondition
  images      String[]
  status      ProductStatus     @default(DRAFT)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  orderItems OrderItem[]
  reviews    Review[]
}

model Order {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  totalAmount     Decimal
  status          OrderStatus @default(PENDING)
  shippingAddress String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items   OrderItem[]
  payment Payment?
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  vendorId  String
  quantity  Int
  unitPrice Decimal
  subtotal  Decimal
}

model Payment {
  id            String        @id @default(uuid())
  orderId       String        @unique
  order         Order         @relation(fields: [orderId], references: [id])
  amount        Decimal
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  transactionId String?
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
}

model Review {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  vendorId  String
  vendor    Vendor   @relation(fields: [vendorId], references: [id])
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
}

model Banner {
  id        String    @id @default(uuid())
  title     String
  subtitle  String?
  imageUrl  String
  ctaLabel  String?
  ctaLink   String?
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

`Banner` powers the rotating hero carousel on the buyer home page. The home page Server Component queries active banners (`isActive` and within `startsAt`/`endsAt`) ordered by `sortOrder` — no code change needed to update homepage promos. Admin CRUD lives at `app/admin/banners`.

Notes:
- `User.authId` links to `auth.users.id` from Supabase Auth — Prisma owns the business data, Supabase owns credentials/sessions.
- `AuthSession` from the original UML is intentionally **not** modeled in Prisma — Supabase Auth manages sessions/refresh tokens itself.

---

## 5. Folder Structure

```
vint/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  │  ├─ (shop)/                 # public + buyer
│  │  │  ├─ page.tsx             # home/browse
│  │  │  ├─ products/[id]/page.tsx
│  │  │  ├─ cart/page.tsx
│  │  │  ├─ checkout/page.tsx
│  │  │  └─ orders/page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  └─ signup/page.tsx
│  │  ├─ vendor/
│  │  │  ├─ apply/page.tsx
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ listings/[id]/page.tsx
│  │  │  └─ orders/page.tsx
│  │  ├─ admin/
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ banners/page.tsx
│  │  │  ├─ vendor-applications/page.tsx
│  │  │  ├─ listings/page.tsx
│  │  │  ├─ users/page.tsx
│  │  │  └─ categories/page.tsx
│  │  └─ api/
│  │     └─ payments/[provider]/webhook/route.ts
│  ├─ components/
│  │  ├─ ui/                     # shadcn primitives
│  │  └─ shared/                 # ProductCard, StatusBadge, RatingStars…
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ supabase/ (client.ts, server.ts)
│  │  ├─ auth/guards.ts
│  │  ├─ actions/ (products.ts, orders.ts, vendors.ts, admin.ts)
│  │  └─ validation/ (zod schemas)
│  └─ middleware.ts
├─ PRD.md
└─ IMPLEMENTATION_PLAN.md
```

One `actions/*.ts` file per domain, each function doing: validate → guard → Prisma call → return typed result. No repository/service abstraction layer — keeps the call stack shallow and greppable.

---

## 6. Build Phases (course-scoped)

| Phase | Scope |
|---|---|
| **0. Setup** | Repo, Next.js + TS + Tailwind + shadcn init, Supabase project, Prisma connected, deploy skeleton to Vercel. |
| **1. Auth & Roles** | Sign up/login (email + OTP), session handling, `User`/`UserProfile` creation on first login, role guard utilities. |
| **2. Catalog (read)** | Category seed, Product model, browse/search/filter UI, product detail page. |
| **3. Vendor Application** | Apply form, `Vendor` model (PENDING), buyer-facing status page. |
| **4. Admin: Vendor Review** | Admin queue, approve/reject + notes, role upgrade on approval. |
| **5. Vendor Dashboard** | Listing CRUD (with image upload to Supabase Storage), vendor order view. |
| **6. Cart & Checkout** | Cart (client state + server action to create Order/OrderItems), address form, COD path first. |
| **7. Payments** | eSewa/Khalti integration behind the existing checkout, webhook route, Payment status sync. |
| **8. Reviews** | Post-delivery review flow, vendor/product rating aggregation. |
| **9. Admin Moderation, Banners & Analytics** | Flag/remove listings, user suspension, homepage banner CRUD (image, CTA, schedule, reorder), basic analytics dashboard. |
| **10. Polish/QA** | Empty states, error handling, responsive pass, accessibility pass, seed/demo data. |

Each phase should be shippable/demoable on its own — matches an academic term's iterative deliverables better than a big-bang build.

---

## 7. What the HTML Demo (`vinted.html`) Covers

A static, dependency-free HTML/CSS/JS prototype (no build step) used to align the team on UX and the design system **before** writing Next.js code:

- Design System reference screen (colors, type scale, buttons, badges, cards).
- Buyer flow: home (auto-rotating hero banner carousel) → browse/filter → product detail → cart → checkout → order confirmation/tracking.
- Vendor flow: apply → pending status → dashboard → add listing → orders.
- Admin flow: dashboard → banner management (add/reorder/schedule) → vendor application review (approve/reject with notes) → listings moderation → analytics.
- Auth screens: login/signup.

It intentionally does not wire up real data/persistence — it's a clickable spec, not the app.
