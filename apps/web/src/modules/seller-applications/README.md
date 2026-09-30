# seller-applications

**Purpose:** the seller onboarding workflow. A buyer applies to become a seller, an admin reviews the application, calls the applicant to verify their details, and approves or rejects it.

**Structure**

- `seller-application.types.ts` - `SellerApplicationRecord` view model.
- `seller-application.constants.ts` - status labels, badge tones and admin list filters.
- `seller-application.repository.ts` - Prisma access. `transition` only updates a row if it is still in an expected status.
- `seller-application.service.ts` - business rules: permission checks, state transitions, the approval transaction, audit entries.
- `seller-application.actions.ts` - Server Actions (validate input, check permission, call the service, revalidate pages).
- `components/` - `SellerApplicationForm` (buyer), `AdminReviewPanel` (admin), `ApplicationStatusBadge`.

**Funnel**

- User flow (buyer): open `/sell/apply`, fill the form, land on `/sell/status` and wait. After approval the account becomes a seller and `/seller` opens.
- User flow (admin): open `/admin/seller-applications`, open an application, start the review, call the applicant, save the call notes, then approve or reject.
- Technical flow: form -> `seller-application.actions.ts` -> `parseFormData` (Zod) -> `assertActionPermission` -> `sellerApplicationService` -> `sellerApplicationRepository` -> database.

**Non-obvious rationale**

- Status flow: `PENDING -> IN_REVIEW -> APPROVED`, and `PENDING` or `IN_REVIEW -> REJECTED`. The allowed moves live in `@feri/shared` (`status-transitions.ts`) so the UI and the service agree.
- Approval is refused until a verification call has been recorded. The phone call is a deliberate trust step, not a formality.
- Approval runs in one transaction: mark the application approved, promote the user from `BUYER` to `SELLER`, create the seller profile, write the audit log. If any step fails, nothing is saved.
- Concurrency: status changes use `updateMany ... where status in (...)`. If two admins act at once, only one update matches and the other gets a clear "just updated by someone else" error.
- A database partial unique index (`seller_applications_one_open_per_applicant`) guarantees a person never has two open applications, even if two submissions race.
- A rejected applicant can apply again; the previous application stays as history.
