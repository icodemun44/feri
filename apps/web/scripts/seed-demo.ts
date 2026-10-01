import {
  prisma,
  ProductReviewStatus,
  ProductStatus,
  Role,
  SellerApplicationStatus,
  SellerStatus,
} from "@feri/database";
import { rupeesToPaisa } from "@feri/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEMO_CATALOG_PRODUCTS } from "./demo-catalog/products";
import { createAdminClient, ensureUser } from "./lib/auth-users";

const LOCAL_SUPABASE_HOSTS = ["127.0.0.1", "localhost"];
const DEMO_PASSWORD = "Password123!";
const MILLISECONDS_PER_HOUR = 3_600_000;
const UNCHECKED_DEMO_PRODUCT_TITLES: readonly string[] = ["Headphones", "Leather cap"];
const LEGACY_DEMO_PRODUCT_TITLES = [
  "Vintage denim jacket",
  "Wool overcoat, charcoal",
  "Floral summer dress",
  "Casio vintage digital watch",
  "Analog field watch",
  "Leather sling bag",
  "Canvas backpack, olive",
  "Mechanical keyboard",
  "Bluetooth headphones",
  "Android phone, 64GB",
  "Ceramic mug set of four",
  "Hardcover novels, set of five",
] as const;
const PRODUCT_IMAGE_BUCKET = "product-images";
const JPEG_CONTENT_TYPE = "image/jpeg";
const DEMO_IMAGES_DIRECTORY = join(import.meta.dirname, "demo-catalog", "images");

const DEMO_ACCOUNTS = {
  admin: { email: "admin@feri.test", fullName: "Demo Admin", phone: "9800000001" },
  seller: { email: "seller@feri.test", fullName: "Maya Gurung", phone: "9800000002" },
  buyer: { email: "buyer@feri.test", fullName: "Aayush Shrestha", phone: "9800000003" },
} as const;

const assertLocalSupabase = (): void => {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  const isLocal = LOCAL_SUPABASE_HOSTS.some((host) => url.includes(host));
  if (!isLocal || process.env["NODE_ENV"] === "production") {
    throw new Error("Demo data can only be seeded against a local Supabase instance");
  }
};

const seedSeller = async (sellerUserId: string): Promise<string> => {
  const existingSeller = await prisma.seller.findUnique({ where: { userId: sellerUserId } });
  if (existingSeller) {
    return existingSeller.id;
  }

  const application = await prisma.sellerApplication.create({
    data: {
      applicantId: sellerUserId,
      status: SellerApplicationStatus.APPROVED,
      businessName: "Maya's Closet",
      description: "Curated second-hand jackets, dresses and accessories sourced locally.",
      contactEmail: DEMO_ACCOUNTS.seller.email,
      contactPhone: DEMO_ACCOUNTS.seller.phone,
      city: "Kathmandu",
      verificationCallAt: new Date(),
      verificationNotes: "Demo seller, verified during seeding.",
      decidedAt: new Date(),
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: sellerUserId,
      applicationId: application.id,
      slug: "mayas-closet",
      businessName: application.businessName,
      description: application.description,
      contactEmail: application.contactEmail,
      contactPhone: application.contactPhone,
      city: application.city,
      status: SellerStatus.ACTIVE,
    },
  });
  return seller.id;
};

const removeLegacyDemoProducts = async (sellerId: string): Promise<void> => {
  await prisma.product.deleteMany({
    where: { sellerId, title: { in: [...LEGACY_DEMO_PRODUCT_TITLES] }, orderItems: { none: {} } },
  });
};

const uploadDemoImage = async (
  supabase: SupabaseClient,
  storagePath: string,
  imagePath: string,
): Promise<void> => {
  const imageBytes = await readFile(join(DEMO_IMAGES_DIRECTORY, `${imagePath}.jpg`));
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(storagePath, imageBytes, { contentType: JPEG_CONTENT_TYPE, upsert: true });
  if (error) {
    throw new Error(`Could not upload ${imagePath}: ${error.message}`);
  }
};

const seedProducts = async (supabase: SupabaseClient, sellerId: string): Promise<number> => {
  await removeLegacyDemoProducts(sellerId);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const existingProducts = await prisma.product.findMany({
    where: { sellerId },
    select: { title: true },
  });
  const existingTitles = new Set(existingProducts.map((product) => product.title));

  const now = Date.now();
  let createdCount = 0;
  for (const [index, product] of DEMO_CATALOG_PRODUCTS.entries()) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Category "${product.categorySlug}" is missing. Run pnpm db:seed first.`);
    }
    if (existingTitles.has(product.title)) {
      continue;
    }

    const productId = randomUUID();
    const storagePath = `${sellerId}/${productId}/${randomUUID()}.jpg`;
    await uploadDemoImage(supabase, storagePath, product.imagePath);

    const isUnchecked = UNCHECKED_DEMO_PRODUCT_TITLES.includes(product.title);
    await prisma.product.create({
      data: {
        id: productId,
        sellerId,
        categoryId,
        title: product.title,
        description: product.description,
        priceMinor: rupeesToPaisa(product.priceRupees),
        condition: product.condition,
        status: ProductStatus.ACTIVE,
        reviewStatus: isUnchecked ? ProductReviewStatus.PENDING : ProductReviewStatus.APPROVED,
        reviewedAt: isUnchecked ? null : new Date(),
        brand: product.brand ?? null,
        publishedAt: new Date(now - index * MILLISECONDS_PER_HOUR),
        images: { create: { storagePath, altText: product.title, position: 0 } },
      },
    });
    createdCount += 1;
  }
  return createdCount;
};

const main = async (): Promise<void> => {
  assertLocalSupabase();
  const supabase = createAdminClient();

  await ensureUser(supabase, { ...DEMO_ACCOUNTS.admin, password: DEMO_PASSWORD, role: Role.ADMIN });
  await ensureUser(supabase, { ...DEMO_ACCOUNTS.buyer, password: DEMO_PASSWORD, role: Role.BUYER });
  const seller = await ensureUser(supabase, {
    ...DEMO_ACCOUNTS.seller,
    password: DEMO_PASSWORD,
    role: Role.SELLER,
  });

  const sellerId = await seedSeller(seller.id);
  const createdProducts = await seedProducts(supabase, sellerId);

  console.log(`Demo data ready (${createdProducts} products created).`);
  console.log(`Log in with any of these accounts, password: ${DEMO_PASSWORD}`);
  Object.values(DEMO_ACCOUNTS).forEach(({ email }) => console.log(`  ${email}`));
};

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
