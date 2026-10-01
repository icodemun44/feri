# cart

**Purpose:** the items a signed-in buyer has set aside to buy.

**Structure**

- `cart.types.ts` - `CartLine`, `CartSellerGroup` (one group per seller) and `CartView`.
- `cart.repository.ts` - Prisma access. Works out whether each line is still available to buy.
- `cart.service.ts` - permission checks, adding and removing, and grouping lines by seller with a delivery fee per group.
- `cart.actions.ts` - Server Actions for add and remove.
- `components/` - `AddToCartButton` (product page) and `RemoveFromCartButton`.

**Funnel**

- User flow: on a product page choose Add to cart, open the cart from the header, review what you have, then continue to checkout.
- Technical flow: button -> `cart.actions.ts` -> `assertActionPermission` -> `cartService` -> `cartRepository` -> database.

**Non-obvious rationale**

- The cart is stored in the database (table `cart_items`), not in the browser, so it follows the buyer across devices.
- Every item is one of a kind, so there is no quantity. A product can be in a cart only once, enforced by a unique constraint, which makes adding twice harmless.
- Items from different sellers are grouped, because checkout creates one order per seller. Each group has its own delivery fee.
- A line is "unavailable" when the product is no longer live, is out of stock or its seller is suspended. Unavailable lines are shown separately and must be removed before checkout.
- A seller cannot add their own listing, and admins cannot use the cart at all.
- The cart holds at most 30 items.
