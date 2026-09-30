# sellers

**Purpose:** the approved seller profile that a buyer becomes once their application is approved.

**Structure**

- `seller.repository.ts` - Prisma access for sellers.
- `seller.service.ts` - `generateUniqueSlug` builds the public shop address from the business name.

**Funnel**

- User flow: an admin approves an application and the applicant gets a seller dashboard.
- Technical flow: `sellerApplicationService.approve` -> `sellerService.generateUniqueSlug` -> `sellerRepository.create`, all inside one transaction.

**Non-obvious rationale**

- The seller profile is a separate table from the application. The application stays as a permanent record of what was submitted and reviewed, while the seller profile can later be edited or suspended without rewriting history.
