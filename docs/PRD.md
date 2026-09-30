# Product Requirements Document — Feri Nepal

**Brand:** Feri Nepal (short/handle: **Ferinep**)
**Course:** PRG100 — System Analysis and Design, Westcliff University
**Group:** Vinted
**Status:** Draft v3
**Last updated:** 2026-09-30

> Note: this PRD carries forward the scope, feature list, and cost baseline from the Week 2 VCS document (12 KLOC / 141 FP / COCOMO ~32.6 person-months) and the Week 4 UML class diagram / Week 5 ER diagram, translated into a buildable Next.js + Supabase + Prisma product spec.

---

## 1. Overview

**Feri Nepal** ("feri" — Nepali for "again") is a peer-to-peer thrift marketplace where everyday users can buy and sell second-hand clothes, watches, bags, tech, and other used goods. Any registered user can apply to become a **Vendor** (seller); an **Admin** manually reviews and calls each applicant to verify identity/business details before activating the vendor account. The platform is a standard e-commerce architecture: catalog, cart, checkout, orders, payments, reviews — scoped down to three roles (Buyer, Vendor, Admin) with clear permission boundaries.

### 1.1 Problem Statement
Second-hand goods trading in the target market (Nepal) is fragmented across informal channels (Facebook groups, word-of-mouth) with no trust layer, no standard checkout, and no seller accountability. Buyers can't verify sellers; sellers have no storefront or reputation system.

### 1.2 Goals
- Give buyers a trustworthy, searchable catalog of second-hand items across multiple categories.
- Give anyone a path to become a verified seller without needing a separate business platform.
- Give admins a lightweight but real moderation and verification workflow (not just a rubber stamp).
- Ship an MVP that a 3–4 person student team can build, understand, and maintain without over-engineering.

### 1.3 Non-Goals (out of scope for MVP)
- Native mobile apps (web-responsive only).
- Real-time chat between buyer/vendor (flagged as a fast-follow; UI hook only in MVP).
- Multi-vendor cart splitting into separate shipments/invoices per vendor in v1 (single order can reference multiple vendors' items, but shipping/payment settlement stays simple).
- International shipping / multi-currency.
- Automated fraud detection (manual admin review only).

---

## 2. Users & Roles

| Role | Description | How they're created |
|---|---|---|
| **Buyer** (default) | Any signed-up user. Browses, buys, reviews, can apply to become a Vendor. | Self-service sign-up (email or phone OTP) |
| **Vendor** | A Buyer whose Vendor Application has been approved. Lists products, fulfills orders, views earnings. | Buyer submits Vendor Application → Admin approves |
| **Admin** | Platform staff. Reviews vendor applications (incl. a verification call), moderates listings/users, views platform analytics. | Seeded manually (not self-registrable) |

A single `User` always has role `BUYER` by default; becoming a vendor **adds** a linked `Vendor` profile and upgrades effective permissions — it does not replace the buyer identity (a vendor can still buy).

### 2.1 Role Permission Matrix

| Capability | Buyer | Vendor (verified) | Admin |
|---|:---:|:---:|:---:|
| Browse/search/filter catalog | ✅ | ✅ | ✅ |
| Add to cart / checkout / pay | ✅ | ✅ | ✅ |
| Leave product/seller reviews | ✅ (if purchased) | ✅ | ✅ |
| Submit Vendor Application | ✅ | — | — |
| Create/edit/delete own listings | ❌ | ✅ | ✅ (moderation) |
| View own sales & earnings | ❌ | ✅ | ✅ (all) |
| View/manage own orders as seller | ❌ | ✅ | ✅ (all) |
| Approve/reject Vendor Applications | ❌ | ❌ | ✅ |
| Suspend a vendor / delist a product | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |
| Manage homepage banners | ❌ | ❌ | ✅ |
| View platform-wide analytics | ❌ | ❌ | ✅ |

---

## 3. Core User Flows

### 3.1 Buyer Flow
1. Sign up / log in (email + password, or phone OTP).
2. Browse home feed → filter by category (Clothes, Watches, Bags, Tech, Other), price range, condition, size.
3. Search by keyword.
4. Open product detail → view images, condition, price, vendor profile/rating, reviews.
5. Add to cart (or Buy Now).
6. Checkout → shipping address → payment method (eSewa / Khalti / Cash on Delivery) → confirm order.
7. Track order status (Pending → Paid → Shipped → Delivered).
8. Leave a review/rating for the product and vendor after delivery.
9. Apply to become a Vendor from profile menu at any time.

### 3.2 Vendor Application Flow
1. Buyer clicks "Become a Vendor" → fills application (business/display name, description, contact phone, contact email, category focus).
2. Application status = `PENDING`, visible to the applicant on their dashboard.
3. Admin reviews the application in the Admin queue, **calls the applicant** to verify identity/details, and logs a verification note.
4. Admin sets status to `VERIFIED` (approved) or `REJECTED` (with a reason shown to the applicant).
5. On `VERIFIED`, the user's account gains vendor capabilities and a Vendor Dashboard becomes available.

### 3.3 Vendor Flow (post-verification)
1. Vendor Dashboard: overview of active listings, pending orders, total earnings, rating.
2. Create listing: title, category, description, price, condition, quantity (typically 1 for unique thrift items), up to N photos.
3. Manage listings: edit price/description, mark as sold/removed, see view counts.
4. Manage incoming orders: see items sold, mark as shipped, view buyer shipping address.
5. View earnings/payout summary (COD vs. digital payments reconciliation).

### 3.4 Admin Flow
1. Admin Dashboard: pending vendor applications count, flagged listings count, today's orders/GMV, active users/vendors.
2. Vendor Applications queue: view applicant details → mark "Call completed" with notes → Approve / Reject.
3. Listings moderation: view flagged/reported products → remove listing or warn/suspend vendor.
4. User management: view users, suspend accounts.
5. Category management: create/edit/archive categories.
6. Homepage banner management: create/reorder/schedule/retire the rotating hero banners shown on the buyer home page.
7. Platform analytics: orders over time, GMV, top categories, top vendors.

---

## 4. Functional Requirements

### 4.1 Authentication & Accounts
- Email/password and phone OTP sign-up/sign-in (via Supabase Auth).
- Password reset via email.
- Profile management (name, display name, avatar, bio).
- Session-based route protection by role.

### 4.2 Catalog & Search
- Categories: Clothes, Watches, Bags, Tech, Other (extensible; admin-managed).
- Product listing: multi-image upload (stored in Supabase Storage), title, description, price, condition (New/Like New/Good/Fair), category, optional size/brand attributes.
- Search by keyword; filter by category, price range, condition; sort by price/newest.
- Product detail page with vendor mini-profile (name, rating, member since, number of listings).

### 4.3 Cart & Checkout
- Cart persists per logged-in user.
- Checkout collects shipping address, selects payment method: **eSewa**, **Khalti**, or **Cash on Delivery (COD)**.
- Order confirmation and order-status tracking (Pending → Paid → Shipped → Delivered → Cancelled).

### 4.4 Payments
- eSewa / Khalti integration for digital payment (redirect + callback verification).
- COD orders tracked with a manual "collected" confirmation step by the vendor.
- Payment record stores method, status, transaction id, paid-at timestamp.

### 4.5 Vendor Management
- Vendor Application submission form.
- Admin review workflow with status (`PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`) and verification notes/call log.
- Vendor dashboard: listings CRUD, order fulfillment, earnings summary.

### 4.6 Reviews & Ratings
- Buyers who completed an order can rate (1–5) and review the product/vendor.
- Vendor average rating shown on profile and product cards.

### 4.7 Admin & Moderation
- Vendor application review queue.
- Listing flag/report + removal.
- Category CRUD.
- Basic analytics (orders, GMV, active vendors).

### 4.7a Homepage Banner Management
- Admin can create a banner: image, headline, subtext, CTA label + link, start/end date, active toggle.
- Buyer home page displays all currently-active banners (within their start/end window) as an auto-rotating hero carousel (~4–5s per slide, manual prev/next + dot navigation).
- Admin can reorder banners (controls rotation sequence), deactivate without deleting, or schedule a future banner (shown as "Scheduled" until its start date).
- No code deploy required to change homepage promotional content.

### 4.8 Notifications (MVP-light)
- In-app status banners for order updates and vendor application decisions.
- Email notification on vendor approval/rejection and order confirmation (via Supabase/Resend — can be stubbed for MVP demo).

---

## 5. Data Model

Derived from the Week 4 UML class diagram and Week 5 ER diagram, adapted for Prisma/Postgres:

- **User** — id, name, email, phone, role (`BUYER` \| `VENDOR` \| `ADMIN`), createdAt
- **UserProfile** — userId, firstName, lastName, displayName, profileImage, bio
- **Vendor** — id, userId, businessName, description, contactEmail, phone, status (`PENDING` \| `VERIFIED` \| `REJECTED` \| `SUSPENDED`), verificationNotes, createdAt, updatedAt
- **Category** — id, name, slug, description
- **Product** — id, vendorId, categoryId, name, description, price, condition, images[], status (`DRAFT` \| `ACTIVE` \| `SOLD` \| `REMOVED` \| `FLAGGED`), createdAt, updatedAt
- **Order** — id, userId, totalAmount, status (`PENDING` \| `PAID` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED`), shippingAddress, createdAt, updatedAt
- **OrderItem** — id, orderId, productId, vendorId, quantity, unitPrice, subtotal
- **Payment** — id, orderId, amount, method (`ESEWA` \| `KHALTI` \| `COD`), status (`PENDING` \| `COMPLETED` \| `FAILED` \| `REFUNDED`), transactionId, paidAt
- **Review** — id, userId, productId, vendorId, rating, comment, createdAt
- **Banner** — id, title, subtitle, imageUrl, ctaLabel, ctaLink, sortOrder, isActive, startsAt, endsAt, createdAt, updatedAt

Auth sessions are handled by Supabase Auth directly and are **not** duplicated in the Prisma schema (see Implementation Plan §3 for rationale).

Full Prisma schema lives in `IMPLEMENTATION_PLAN.md`.

---

## 6. Non-Functional Requirements

- **Simplicity first:** every teammate should be able to read a file and understand it without extra abstraction layers. Prefer straightforward server actions/route handlers over generic service/repository layers.
- **Security:** role checks enforced server-side on every mutation; never trust client-submitted role/ownership fields; signed URLs for private storage where needed.
- **Performance:** product feed paginated (cursor or offset), images served via Supabase CDN with resizing.
- **Reliability:** payment webhook handling idempotent (safe to receive duplicate callbacks).
- **Maintainability:** typed end-to-end (TypeScript + Prisma + Zod), consistent folder structure (see Implementation Plan).
- **Accessibility:** semantic HTML, sufficient color contrast, keyboard-navigable forms.

---

## 7. Design System (summary)

Full interactive design system + component reference lives in the HTML demo (`vinted.html`). Summary:

- **Brand feel:** warm, earthy, grounded — thrifted-but-curated, not flashy.
- **Color:** deep umber-brown primary `#473536` with near-black ink `#0A0708` for depth/text, muted brick-red accent `#8D4343` (CTA/energy), warm taupe `#ABA79F` as the neutral/muted tone, semantic colors (green/amber/red/blue) reserved for status badges (pending/verified/rejected/sold) so they stay distinct from brand color.
- **Type:** system UI font stack, clear scale (display/h1–h3/body/small/caption).
- **Components:** navbar, category chips, product card, condition/status badges, rating stars, forms/inputs, buttons (primary/secondary/ghost/danger), tables (admin), stat cards, empty states.
- **Layout:** 12-column responsive grid, mobile-first, max content width ~1280px.

---

## 8. Success Metrics (for a course demo / early launch)

- # of completed vendor applications processed end-to-end (apply → call → verify).
- # of listings created, # of orders completed.
- Checkout completion rate (cart → paid order).
- Time-to-verify for vendor applications.

---

## 9. Risks & Assumptions

- **Assumption:** Admin verification is manual (phone call) by design — not automatable in MVP; UI only needs to support logging the outcome, not placing the call.
- **Risk:** Mixing Prisma with Supabase Row-Level Security can get complex fast — mitigated by keeping all writes behind server-side role checks in Next.js instead of relying on RLS as the primary gate (see Implementation Plan).
- **Risk:** Payment gateway (eSewa/Khalti) sandbox access may be slow to obtain — plan to build COD first, layer in digital payment behind a feature flag.
- **Assumption:** Single shared national currency (NPR) and domestic shipping only for MVP.

---

## 10. Milestones (mapped from Week 2 cost estimate)

The Week 2 COCOMO estimate (~32.6 person-months, ~9.4 months, 3–4 devs) reflects a *commercial* build. For the course project, scope is reduced to an MVP achievable by a 3–4 person student team in an academic term — see `IMPLEMENTATION_PLAN.md` §6 for the condensed phase plan.
