# Product Requirements Document - Feri Nepal

**Brand:** Feri Nepal (short name and handle: Ferinep). "Feri" means "again" in Nepali.
**Course:** PRG100 - System Analysis and Design, Westcliff University
**Group:** Vinted
**Status:** Draft v4 (foundation built)
**Last updated:** 2026-10-01

This PRD carries forward the scope, feature list and cost baseline from the Week 2 VCS document, the Week 4 UML class diagram and the Week 5 ER diagram, and translates them into a buildable Next.js, Supabase and Prisma product. The Week 4 "Vendor" entity is called **Seller** everywhere in the product and code.

---

## 1. Overview

Feri Nepal is a peer-to-peer thrift marketplace where people buy and sell pre-loved clothes, watches, bags, tech and other goods. Any registered user can apply to become a **Seller**. An **Admin** reviews each application, calls the applicant on the phone number they gave to verify their details, and then approves or rejects it. The platform follows a standard e-commerce shape: catalog, cart, checkout, orders, payments and reviews, for three roles: Buyer, Seller and Admin.

### 1.1 Problem statement

Second-hand trading in Nepal is scattered across informal channels (Facebook groups, word of mouth) with no trust layer, no standard checkout and no seller accountability. Buyers cannot verify sellers; sellers have no storefront or reputation.

### 1.2 Goals

- Give buyers a trustworthy, searchable catalog of second-hand items.
- Give anyone a path to become a verified seller without a separate business platform.
- Give admins a real verification workflow (application, phone call, decision), not a rubber stamp.
- Keep the codebase small and readable enough for a student team to understand and extend.

### 1.3 MVP scope decisions

- **Payments: cash on delivery (COD) only.** eSewa and Khalti are planned for a later release. The data model already has a generic payment method and status so they can be added without restructuring.
- **One order per seller.** A cart with items from several sellers is split into one order per seller, which keeps COD collection and shipping simple.
- **Web only**, mobile responsive. No native apps.
- **Out of scope for MVP:** real-time chat, international shipping, multi-currency, automated fraud detection.

---

## 2. Users and roles

| Role            | Description                                                                              | How it is created                                                |
| --------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Buyer (default) | Any signed-up user. Browses, buys, reviews, and can apply to become a Seller.            | Self sign-up (email and password)                                |
| Seller          | A Buyer whose application was approved. Lists products, fulfils orders, sees earnings.   | Buyer applies, Admin approves                                    |
| Admin           | Platform staff. Reviews seller applications, moderates, manages banners, sees analytics. | Created by a script (`pnpm admin:create`), never self-registered |

A user's role always starts as Buyer. Approval of a seller application upgrades the role to Seller inside a single database transaction. The role is stored in the application database and is never read from anything the client can change.

### 2.1 Permission matrix

| Capability                             | Buyer                | Seller (active) | Admin |
| -------------------------------------- | -------------------- | --------------- | ----- |
| Browse, search and filter the catalog  | Yes                  | Yes             | Yes   |
| Place orders (cash on delivery)        | Yes                  | Yes             | -     |
| Review products and sellers            | Yes (after delivery) | Yes             | -     |
| Apply to become a seller               | Yes                  | -               | -     |
| See own seller application             | Yes                  | Yes             | -     |
| Create and edit own listings           | -                    | Yes             | -     |
| Fulfil own orders                      | -                    | Yes             | -     |
| Review, approve or reject applications | -                    | -               | Yes   |
| Suspend a seller, moderate listings    | -                    | -               | Yes   |
| Manage categories and homepage banners | -                    | -               | Yes   |
| Manage users, view platform analytics  | -                    | -               | Yes   |

The same matrix lives in code in `packages/shared/src/permissions.ts` and is enforced server-side.

---

## 3. Core user flows

### 3.1 Buyer

1. Sign up with name, email, mobile number and password, or log in.
2. Browse the home page (rotating promotional banners, categories, fresh finds) or search and filter the catalog by category, keyword and sort order.
3. Open a product: images, condition, price, seller and details.
4. Add to cart and check out with a shipping address, paying cash on delivery. _(planned)_
5. Follow the order through placed, confirmed, shipped and delivered. _(planned)_
6. Leave a rating and review after delivery. _(planned)_
7. Apply to become a seller at any time from the account page.

### 3.2 Seller application (built)

1. A buyer opens "Sell" and fills in the application: shop name, description, contact email, contact phone, city and main category.
2. The application is saved as **Waiting for review** (`PENDING`). The applicant can see its status at any time.
3. An admin opens the queue (oldest first) and starts the review (`IN_REVIEW`).
4. The admin calls the applicant on the phone number provided and records call notes (what was confirmed).
5. The admin approves or rejects. Approval is only possible after the call has been recorded. Rejection requires a reason that the applicant can see, and the applicant can apply again.
6. On approval the user becomes a Seller, a seller profile is created, and the seller dashboard opens.

Every step writes an audit log entry. A person can never have two open applications.

### 3.3 Seller _(listings and orders planned)_

1. Open the seller dashboard.
2. Create listings with photos, price, condition, category and quantity.
3. Confirm and ship orders, and mark cash as collected on delivery.
4. See earnings and ratings.

### 3.4 Admin

1. Dashboard with counts of waiting, in-review, approved and rejected applications (built).
2. Seller application queue and review screen with phone call notes (built).
3. Homepage banner management: create, reorder, schedule and retire the rotating banners. _(planned, data model and permission exist)_
4. Listing moderation, user management, category management and analytics. _(planned)_

---

## 4. Functional requirements and status

| Area              | Requirement                                                                                         | Status  |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------- |
| Accounts          | Email and password sign-up and login through Supabase Auth, session refresh, logout                 | Built   |
| Accounts          | Role-based access control enforced server-side and at the route level                               | Built   |
| Catalog           | Categories, product list with keyword search, category filter, sorting and pagination               | Built   |
| Catalog           | Product detail page with seller information                                                         | Built   |
| Home page         | Auto-rotating hero banner carousel (pause, previous, next, reduced-motion aware)                    | Built   |
| Seller onboarding | Application form, status page, admin queue, phone-call notes, approve and reject                    | Built   |
| Audit             | Audit log for every seller application step                                                         | Built   |
| Seller            | Seller dashboard shell                                                                              | Built   |
| Seller            | Listing create, edit, publish, mark as sold and delete, with photo upload to Supabase Storage       | Built   |
| Admin             | Listings section: check new listings after they go live, or remove them with a reason               | Built   |
| Catalog           | "Checked" and "Not yet checked" tags on cards and a clear banner on the product page                | Built   |
| Cart and checkout | Cart, delivery address, cash on delivery orders (one order per seller), buyer order list and cancel | Built   |
| Orders            | Seller fulfilment (confirm, ship, deliver, cancel with a reason) and cash collection on delivery    | Built   |
| Reviews           | Ratings and reviews after delivery                                                                  | Planned |
| Admin             | Banner management, category management, listing moderation, user management, analytics              | Planned |
| Payments          | eSewa and Khalti integration                                                                        | Later   |
| Notifications     | Email for application decisions and order confirmations                                             | Later   |

---

## 5. Data model

Derived from the Week 4 UML and Week 5 ER diagrams. Full details in `docs/database.md`.

| Entity            | Purpose                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| User              | Application user linked to a Supabase Auth identity; holds the role               |
| UserProfile       | Name, phone, avatar, bio                                                          |
| SellerApplication | A buyer's request to become a seller, with review status, call notes and decision |
| Seller            | Approved seller profile (shop name, slug, contact details, status)                |
| Category          | Product categories                                                                |
| Product           | A listing: title, description, price in paisa, condition, status, quantity        |
| ProductImage      | Ordered images for a product (storage paths)                                      |
| Order             | A buyer's order from one seller, with a shipping address snapshot and totals      |
| OrderItem         | Line items with title and price snapshots                                         |
| Payment           | One payment per order: method (COD), status, amount                               |
| Review            | One review per purchased item                                                     |
| Banner            | Homepage carousel slides with tone, schedule and sort order                       |
| AuditLog          | Append-only record of sensitive actions                                           |

Money is stored as whole paisa integers to avoid rounding errors.

---

## 6. Non-functional requirements

- **Readability first:** small files, descriptive names, a README in each module, no clever abstractions.
- **Security:** roles enforced server-side; input validated with Zod; Row Level Security enabled on every table; secrets never sent to the browser; safe redirect handling; raw errors never shown to users.
- **Data integrity:** database constraints for the rules that must never break (one open application per person, non-negative prices, valid ratings), plus transactions for multi-step changes.
- **Performance:** filtering, sorting and counting happen in the database; lists are paginated.
- **Reliability:** a non-critical dependency failing (for example banners) must not break the page.
- **Accessibility:** semantic HTML, visible focus, labelled forms, keyboard-friendly carousel, reduced-motion support, sufficient contrast.
- **Maintainability:** typed end to end (TypeScript, Prisma, Zod), one shared set of permission and status rules used by both the UI and the server.

---

## 7. Design system summary

Full reference in `docs/design-system.md`.

- **Feel:** warm, earthy and calm. The interface stays quiet so the products are the focus.
- **Colour:** umber `#473536` (brand, navigation, text accents), ink `#0A0708` (headings and dark surfaces), taupe `#ABA79F` (soft neutral), and a soft clay `#D98F75` for the main call to action. The clay replaced the earlier, heavier brick red because a lighter warm tone feels friendlier and keeps attention on buying. Semantic colours (green, amber, red, blue) are reserved for status only.
- **Type:** Bitter (a warm slab serif) for headings and Mukta for interface text; Mukta also covers Devanagari so Nepali text renders consistently. All fonts are self-hosted through Fontsource.
- **Rules:** no gradients and no emoji anywhere; icons come from Lucide; solid colour surfaces only. A script (`pnpm check:design`) fails the build if either appears.

---

## 8. Architecture summary

A single Next.js application (a modular monolith) with shared packages for the database, validation, shared rules and UI, inside a pnpm and Turborepo workspace. Supabase provides authentication, Postgres and storage; Prisma is the only way application code talks to the database. Details in `docs/architecture.md` and `docs/IMPLEMENTATION_PLAN.md`.

---

## 9. Success metrics

- Seller applications processed end to end (apply, call, decide) and the time to decision.
- Listings created and orders completed.
- Checkout completion rate (cart to delivered order).
- Share of buyers who apply to sell.

---

## 10. Risks and assumptions

- **Manual verification by phone** is deliberate and does not scale forever. The queue, audit log and call notes make it manageable for an MVP.
- **Payment gateway sandboxes** (eSewa, Khalti) can be slow to obtain, which is why COD comes first.
- **Student team experience:** the architecture favours plain, well-named code and small tasks so new contributors can help (see `docs/CONTRIBUTION_PLAN.md`).
- Single currency (NPR) and domestic delivery only for the MVP.

---

## 11. Milestones

The Week 2 COCOMO estimate (about 32.6 person-months for a commercial build) is scoped down to an MVP for the course. Phase status and the remaining plan are in `docs/IMPLEMENTATION_PLAN.md`.
