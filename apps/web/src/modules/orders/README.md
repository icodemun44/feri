# orders

**Purpose:** turning a cart into orders (cash on delivery) and letting buyers follow or cancel them.

**Structure**

- `order.types.ts` - `OrderSummary`, `OrderDetail` and `PlacedOrder`.
- `order.constants.ts` - status and payment labels, the progress steps shown to buyers.
- `order.repository.ts` - Prisma access, including reserving and releasing products.
- `order.service.ts` - `placeFromCart`, `listMine`, `getMine`, `cancelMine`.
- `order.actions.ts` - Server Actions for placing and cancelling.
- `components/` - `CheckoutForm`, `CancelOrderButton`, `OrderStatusBadge`.

**Funnel**

- User flow: checkout form (name, mobile, address) -> Place order -> the orders page confirms it -> the order page shows progress. The buyer can cancel while the order is still "Placed".
- Technical flow: form -> `placeOrderAction` -> `parseFormData` -> `orderService.placeFromCart` -> repositories -> database, all in one transaction.

**Non-obvious rationale**

- One order per seller. If the cart holds items from two sellers, two orders are created, each with its own delivery fee and its own payment record. This keeps shipping and cash collection simple.
- Placing an order reserves each item with a conditional update (`status = ACTIVE` and `quantity > 0` becomes `SOLD`, `quantity = 0`). If another buyer got there first the update count does not match, the whole transaction rolls back, and the buyer sees a clear message. Two people can never buy the same item.
- Cancelling an order puts the items back on sale and marks the payment as not collected.
- The delivery address, item titles and prices are copied onto the order, so later edits to a listing or profile never change a past order.
- Payment is cash on delivery only for now. The payment row already has a method and status so online payments can be added later without a schema change.
- Seller-side handling (confirm, ship, mark delivered, record cash collected) is the next phase. Until then orders stay "Placed".
