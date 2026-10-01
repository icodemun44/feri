# reviews

**Purpose:** letting buyers rate a delivered item, showing seller ratings to shoppers, and letting admins remove abusive reviews.

**Structure**

- `review.types.ts` - `ReviewView`, `AdminReviewView`, `SellerRatingSummary`.
- `review.repository.ts` - Prisma access: create, list, average rating per seller, admin list, guarded removal.
- `review.service.ts` - `create`, `listMineForOrder`, `summarizeSeller`, `listRecentForSeller`, `listForAdmin`, `removeAsAdmin`.
- `review.actions.ts` - Server Actions `createReviewAction` and `removeReviewAction`.
- `components/` - `ReviewForm` (star picker and comment), `ReviewList`, `RemoveReviewForm` (admin).
- Shared pieces: `StarRating` in `components/shared`, validation in `@feri/validation` (`review.ts`).

**Funnel**

- User flow: a buyer opens a delivered order -> rates each item with 1 to 5 stars and an optional comment -> the review shows on the seller's shop page and on every product page of that seller. Admins open Reviews in the admin area, pick a review and remove it with a reason.
- Technical flow: form -> `createReviewAction` -> `parseFormData` -> `reviewService.create` -> repository -> database, with an audit entry in the same transaction.

**Non-obvious rationale**

- A review belongs to one order item, and `order_item_id` is unique, so an item can be reviewed once. The service checks first for a friendly message, and the unique constraint catches two quick clicks.
- Only the buyer of a delivered order can review. The service checks ownership and order status, never the client.
- Reviews are about the seller experience, so ratings are summed per seller. The product page shows the seller's rating, not a per-item rating, because every item is a single piece.
- Admins never edit a review. Removal is a soft delete (`removedAt` and `removalReason`) through a guarded update, so the rating average and shop page drop it at once, and the reason stays in the audit log.
- Reviewer names are shortened for the public (`toPublicReviewerName`), for example "Asha K.".
