# Requirements Check - Feri Nepal

**Checked by:** Member B


**Method:** Each requirement in PRD section 4 was compared with the build phase status in the implementation plan and with the README. This is a document check, not a hands-on test of every screen.

## Totals

| Total checked | Built as planned | Changed | Not built |
| ------------- | ---------------- | ------- | --------- |
| 17            | 12               | 2       | 3         |

- **Built as planned:** done and matches the PRD.
- **Changed:** done, but differently from the earlier plan.
- **Not built:** marked Planned or Later, so it is deliberately not part of the current build.

## Requirement by requirement

| ID  | Area              | Requirement                                                                                | Status    | Note                                                                                                                  |
| --- | ----------------- | ------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------- |
| R1  | Accounts          | Email and password sign-up, login, session refresh, logout (Supabase Auth)                 | Built     | Phase 1 is Done.                                                                                                      |
| R2  | Accounts          | Role-based access control, enforced server-side and at route level                         | Built     | Phase 1 is Done. Permission matrix lives in `packages/shared`.                                                        |
| R3  | Catalog           | Categories, product list with search, category filter, sorting, pagination                 | Built     | Phase 2 is Done.                                                                                                      |
| R4  | Catalog           | Product detail page with seller information                                                | Built     | Phase 2 is Done.                                                                                                      |
| R5  | Home page         | Auto-rotating banner carousel (pause, previous, next, reduced motion)                      | Built     | Phase 2 is Done.                                                                                                      |
| R6  | Seller onboarding | Application form, status page, admin queue, phone-call notes, approve and reject           | Changed   | Works as specified. The Week 4 UML entity "Vendor" was renamed "Seller" everywhere in the product.                    |
| R7  | Audit             | Audit log for every seller application step                                                | Built     | Phase 3 is Done.                                                                                                      |
| R8  | Seller            | Seller dashboard shell                                                                     | Built     | Has since grown into the full seller dashboard with listings.                                                         |
| R9  | Seller            | Listing create, edit, publish, mark as sold, delete, photo upload                          | Built     | Phase 4 is Done. The README does not mention "delete", so confirm it in the running app.                              |
| R10 | Admin             | Listings section: check new listings after they go live, or remove with a reason           | Changed   | Row R15 still lists "listing moderation" as Planned, but a version was built that checks listings after they go live. |
| R11 | Catalog           | "Checked" and "Not yet checked" tags on cards, with a banner on the product page           | Built     | Phase 4 is Done.                                                                                                      |
| R12 | Cart and checkout | Cart, delivery address, cash on delivery, one order per seller, buyer order list and cancel | Built     | Phase 5 is Done.                                                                                                      |
| R13 | Orders            | Seller fulfilment (confirm, ship, deliver, cancel with reason) and cash collection         | Built     | Phase 6 is Done.                                                                                                      |
| R14 | Reviews           | Ratings and reviews after delivery                                                         | Built     | Phase 7 is Done.                                                                                                      |
| R15 | Admin             | Banner management, category management, listing moderation, user management, analytics     | Not built | Status: Planned (Phase 8). The data model and permissions already exist for banners.                                  |
| R16 | Payments          | eSewa and Khalti integration                                                               | Not built | Status: Later (Phase 10). Cash on delivery only for the MVP.                                                          |
| R17 | Notifications     | Email for application decisions and order confirmations                                    | Not built | Status: Later (Phase 10).                                                                                             |

## Problems found in the PRD itself

1. **Section 3.1, steps 4 and 5** (checkout and order tracking) are still marked "planned", but section 4 and the implementation plan say cart, checkout and orders are built (Phases 5 and 6).
2. **Section 3.3 heading** says "listings and orders planned", but listings (Phase 4) and orders (Phase 6) are Done.
3. **Section 3.4, item 4** lists listing moderation as planned, while R10 shows a form of it is built.
4. **Section 3.3, step 4** says sellers "see earnings and ratings". Ratings are built (Phase 7), but earnings do not appear as a requirement in section 4, so it is unclear whether earnings exist.
5. The PRD status line says "Draft v4 (foundation built)", which is older than the content now in the tables.

## Not counted

The non-functional requirements in PRD section 6 (security, accessibility, performance and so on) were not counted in the totals. Accessibility and form quality are covered in `form_check.md`.
