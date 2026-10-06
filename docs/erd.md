# Database diagram (ERD)

Every table in the Feri Nepal database and how they connect. GitHub draws the diagram below automatically. The source of truth is `packages/database/prisma/schema.prisma`.

How to read it: `PK` is the primary key, `FK` a link to another table, `UK` a value that must be unique. A line with `||` on one end means exactly one, `o|` means zero or one, and `o{` means zero or many. Money is stored in paisa (`priceMinor`, `totalMinor`). `AuditLog.entityId` points at different tables depending on `entityType`, so it is not a real foreign key.

```mermaid
erDiagram
  User {
    String id PK
    String authId UK
    String email UK
    Role role
    DateTime suspendedAt
    DateTime createdAt
    DateTime updatedAt
  }
  UserProfile {
    String id PK
    String userId FK,UK
    String fullName
    String phone
    String avatarUrl
    String bio
    DateTime createdAt
    DateTime updatedAt
  }
  Category {
    String id PK
    String name UK
    String slug UK
    String description
    Int sortOrder
    Boolean isActive
    DateTime createdAt
    DateTime updatedAt
  }
  SellerApplication {
    String id PK
    String applicantId FK
    SellerApplicationStatus status
    String businessName
    String description
    String contactEmail
    String contactPhone
    String city
    String primaryCategoryId FK
    String reviewerId FK
    DateTime reviewStartedAt
    DateTime verificationCallAt
    String verificationNotes
    DateTime decidedAt
    String decisionReason
    DateTime createdAt
    DateTime updatedAt
  }
  Seller {
    String id PK
    String userId FK,UK
    String applicationId FK,UK
    String slug UK
    String businessName
    String description
    String contactEmail
    String contactPhone
    String city
    String logoUrl
    SellerStatus status
    DateTime approvedAt
    DateTime createdAt
    DateTime updatedAt
  }
  Product {
    String id PK
    String sellerId FK
    String categoryId FK
    String title
    String description
    Int priceMinor
    ProductCondition condition
    ProductStatus status
    ProductReviewStatus reviewStatus
    DateTime reviewedAt
    String reviewedById FK
    String removalReason
    String brand
    String size
    Int quantity
    DateTime publishedAt
    DateTime soldAt
    DateTime createdAt
    DateTime updatedAt
  }
  ProductImage {
    String id PK
    String productId FK
    String storagePath
    String altText
    Int position
    DateTime createdAt
  }
  Order {
    String id PK
    Int orderNumber UK
    String buyerId FK
    String sellerId FK
    OrderStatus status
    Int subtotalMinor
    Int deliveryFeeMinor
    Int totalMinor
    String shippingFullName
    String shippingPhone
    String shippingAddressLine
    String shippingCity
    String shippingDistrict
    String deliveryNotes
    DateTime placedAt
    DateTime cancelledAt
    String cancellationReason
    DateTime deliveredAt
    DateTime createdAt
    DateTime updatedAt
  }
  OrderItem {
    String id PK
    String orderId FK
    String productId FK
    String titleSnapshot
    Int unitPriceMinor
    Int quantity
    Int subtotalMinor
    DateTime createdAt
  }
  Payment {
    String id PK
    String orderId FK,UK
    PaymentMethod method
    PaymentStatus status
    Int amountMinor
    String gatewayReference
    DateTime completedAt
    DateTime createdAt
    DateTime updatedAt
  }
  Review {
    String id PK
    String orderItemId FK,UK
    String reviewerId FK
    String sellerId FK
    String productId FK
    Int rating
    String comment
    DateTime removedAt
    String removalReason
    DateTime createdAt
    DateTime updatedAt
  }
  Banner {
    String id PK
    String title
    String subtitle
    String ctaLabel
    String ctaHref
    BannerTone tone
    Int sortOrder
    Boolean isActive
    DateTime startsAt
    DateTime endsAt
    DateTime createdAt
    DateTime updatedAt
  }
  AuditLog {
    String id PK
    String actorId FK
    String action
    String entityType
    String entityId
    Json metadata
    DateTime createdAt
  }
  CartItem {
    String id PK
    String userId FK
    String productId FK
    DateTime createdAt
  }
  User ||--o| UserProfile : "user"
  User ||--o{ SellerApplication : "ApplicationApplicant"
  User |o--o{ SellerApplication : "ApplicationReviewer"
  Category |o--o{ SellerApplication : "primaryCategory"
  User ||--o| Seller : "user"
  SellerApplication ||--o| Seller : "application"
  Seller ||--o{ Product : "seller"
  Category ||--o{ Product : "category"
  User |o--o{ Product : "ProductReviewer"
  Product ||--o{ ProductImage : "product"
  User ||--o{ Order : "buyer"
  Seller ||--o{ Order : "seller"
  Order ||--o{ OrderItem : "order"
  Product ||--o{ OrderItem : "product"
  Order ||--o| Payment : "order"
  OrderItem ||--o| Review : "orderItem"
  User ||--o{ Review : "reviewer"
  Seller ||--o{ Review : "seller"
  Product ||--o{ Review : "product"
  User |o--o{ AuditLog : "actor"
  User ||--o{ CartItem : "user"
  Product ||--o{ CartItem : "product"
```

## The main flows

- **Becoming a seller:** a `User` files a `SellerApplication`. When an admin approves it, a `Seller` is created from it.
- **Selling:** a `Seller` owns many `Product` rows. Each product belongs to one `Category` and has up to six `ProductImage` rows.
- **Buying:** a buyer's `CartItem` rows become one `Order` per seller. Each order has its `OrderItem` rows and one `Payment` (cash on delivery).
- **Reviews:** one `Review` per `OrderItem`, allowed after the order is delivered. Ratings are summed per `Seller`.
- **Housekeeping:** `Banner` feeds the home page carousel. `AuditLog` records who did what.
