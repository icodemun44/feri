# listings

**Purpose:** sellers create and manage their listings, and admins check new listings after they go live.

**Structure**

- `listing.types.ts` - `ListingRecord` (full listing with photos) and `ListingSummary` (list rows).
- `listing.constants.ts` - status labels, tones and the admin filter options.
- `image-type.ts` - recognises JPG, PNG and WebP files from their first bytes.
- `listing.repository.ts` - Prisma access. Status changes use a guarded `updateMany` so two actions cannot clash.
- `listing.service.ts` - business rules, ownership checks, review rules, audit entries, photo upload.
- `listing.actions.ts` - Server Actions for the forms (create, edit, publish, unpublish, mark sold, delete, approve, remove).
- `components/` - `ListingForm`, `ListingImageManager`, `ListingActions`, `ListingStatusBadge`, `AdminListingReviewPanel`.
- `src/app/api/seller/listings/[productId]/images` - route handlers that receive photo uploads and deletions.

**Funnel**

- Seller: open Listings, choose New listing, fill in the details, add photos on the next step, then Publish. The listing is live straight away. From the same page they can edit, mark it as sold, unpublish it or delete it.
- Admin: open Listings, look through the "Needs a check" list (oldest first), open a listing, then mark it as checked or remove it with a reason the seller can read.
- Buyer: product cards carry a quiet "Checked" or "Not yet checked" line. The product page shows a clear banner for each state.
- Technical: form -> `listing.actions.ts` -> `parseFormData` -> `assertActionPermission` -> `listingService` -> `listingRepository` -> database. Photos: browser -> route handler -> `listingService.addImage` -> Supabase Storage and the `product_images` table.

**Non-obvious rationale**

- Listings go live as soon as they are published. The review step happens afterwards, so it never slows a seller down. `review_status` (`PENDING` or `APPROVED`) is separate from `status` (draft, live, sold, removed).
- Changing the title, description, category or photos of a checked listing sends it back to "not yet checked". Changing only price, condition, brand or size does not.
- Only live or sold listings appear in the admin check queue. Drafts are private to the seller.
- Admin removal sets `status = REMOVED` and keeps the reason. The seller still sees these listings with the reason; a seller deleting their own listing hides it completely.
- Every listing is a single item (quantity 1), which suits second-hand goods.
- Photos are uploaded through the server, which checks ownership, size (5 MB), file type (by content, not just file name) and the limit of 6 per listing before anything is stored. The Supabase secret key is used only for this and never reaches the browser.
- A live listing must always keep at least one photo.
