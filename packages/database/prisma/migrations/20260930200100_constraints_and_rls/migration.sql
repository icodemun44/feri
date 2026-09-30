-- Data integrity rules Prisma cannot express in the schema file.

ALTER TABLE "users"
  ADD CONSTRAINT "users_email_is_lowercase" CHECK ("email" = lower("email"));

ALTER TABLE "products"
  ADD CONSTRAINT "products_price_non_negative" CHECK ("price_minor" >= 0),
  ADD CONSTRAINT "products_quantity_non_negative" CHECK ("quantity" >= 0);

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_position_non_negative" CHECK ("position" >= 0);

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_amounts_non_negative" CHECK (
    "subtotal_minor" >= 0 AND "delivery_fee_minor" >= 0 AND "total_minor" >= 0
  );

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0),
  ADD CONSTRAINT "order_items_amounts_non_negative" CHECK (
    "unit_price_minor" >= 0 AND "subtotal_minor" >= 0
  );

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_amount_non_negative" CHECK ("amount_minor" >= 0);

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_rating_between_one_and_five" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "banners"
  ADD CONSTRAINT "banners_schedule_is_ordered" CHECK (
    "starts_at" IS NULL OR "ends_at" IS NULL OR "starts_at" < "ends_at"
  );

-- An applicant can only have one open (pending or in review) seller application at a time.
CREATE UNIQUE INDEX "seller_applications_one_open_per_applicant"
  ON "seller_applications" ("applicant_id")
  WHERE "status" IN ('PENDING', 'IN_REVIEW');

-- Customer-facing order numbers start at a friendlier value.
ALTER SEQUENCE "orders_order_number_seq" RESTART WITH 10001;

-- Row Level Security: every table is locked down for the Supabase Data API roles.
-- The application reads and writes through Prisma on the server (table owner), which is not
-- subject to these policies. With no policies defined, anon and authenticated get no access.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seller_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sellers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "banners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Defence in depth on Supabase: also remove direct table privileges from the public API roles.
-- Skipped automatically on plain PostgreSQL (CI, Docker) where those roles do not exist.
DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role
      );
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role
      );
    END IF;
  END LOOP;
END
$$;
