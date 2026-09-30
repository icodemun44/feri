# Role-based access control

## Roles

| Role   | Meaning                                          |
| ------ | ------------------------------------------------ |
| BUYER  | Default for every account                        |
| SELLER | A buyer whose seller application was approved    |
| ADMIN  | Platform staff, created only by the admin script |

The role is stored in the `users` table. It is changed only by approving a seller application (buyer to seller) or by `pnpm admin:create`. It is never taken from the client or from Supabase metadata.

## Three layers of enforcement

1. **Proxy** (`apps/web/src/proxy.ts`): redirects anonymous visitors away from protected routes. It does not check roles, because roles live in our database.
2. **Layouts and pages** (`server/auth/guards.ts`): `requireUser`, `requireRole`, `requireAdmin`, `requireSeller` run on the server for every protected page. A signed-in user with the wrong role gets a 404 (admin area) or is sent to the right place (seller area).
3. **Services** (`server/auth/assert-permission.ts`): every service function that changes or reveals protected data calls `assertPermission(user, PERMISSION)`. This is the layer that really protects the data, because it applies to every caller.

Server actions add a fourth check at the edge with `assertActionPermission`, which also handles "not logged in".

## Permissions

Defined once in `packages/shared/src/permissions.ts` as a map from role to a set of permissions, for example `seller.apply`, `seller.application.review`, `product.manage.own`, `banner.manage`.

To protect something new:

1. Add a permission constant and give it to the right roles.
2. Call `assertPermission` in the service function.
3. If it is a whole page area, add a rule to `packages/shared/src/route-access.ts` and use a guard in the layout.

## Route rules

`route-access.ts` lists the protected path prefixes and the roles allowed for each. The most specific prefix wins, and a prefix only matches whole path segments (`/seller` does not match `/seller-guide`).

## Ownership

Permissions say what a role may do; ownership says which records. Services must also check that the record belongs to the user (for example a seller may only edit their own products). Queries for seller data must filter by the seller id taken from the signed-in user, never from the request.

## Suspended accounts

A user with `suspended_at` set is treated as signed out by `getCurrentUser()`, so every guard denies them. A suspended seller's listings disappear from the catalog.
