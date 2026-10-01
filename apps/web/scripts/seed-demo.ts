import {
  prisma,
  ProductCondition,
  ProductReviewStatus,
  ProductStatus,
  Role,
  SellerApplicationStatus,
  SellerStatus,
} from "@feri/database";
import { rupeesToPaisa } from "@feri/shared";
import { createAdminClient, ensureUser } from "./lib/auth-users";

const LOCAL_SUPABASE_HOSTS = ["127.0.0.1", "localhost"];
const DEMO_PASSWORD = "Password123!";
const MILLISECONDS_PER_HOUR = 3_600_000;
const UNCHECKED_DEMO_PRODUCT_TITLES: readonly string[] = [
  "Bluetooth headphones",
  "Hardcover novels, set of five",
];

const DEMO_ACCOUNTS = {
  admin: { email: "admin@feri.test", fullName: "Demo Admin", phone: "9800000001" },
  seller: { email: "seller@feri.test", fullName: "Maya Gurung", phone: "9800000002" },
  buyer: { email: "buyer@feri.test", fullName: "Aayush Shrestha", phone: "9800000003" },
} as const;

type DemoProduct = {
  title: string;
  description: string;
  priceRupees: number;
  condition: ProductCondition;
  categorySlug: string;
  brand?: string;
  size?: string;
};

const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    title: "Vintage denim jacket",
    description: "Classic 90s cut, softly worn in. No stains or tears. Smoke-free home.",
    priceRupees: 1450,
    condition: ProductCondition.LIKE_NEW,
    categorySlug: "clothes",
    brand: "Levi's",
    size: "M",
  },
  {
    title: "Wool overcoat, charcoal",
    description: "Warm mid-length coat, lined, barely worn for one winter.",
    priceRupees: 2800,
    condition: ProductCondition.LIKE_NEW,
    categorySlug: "clothes",
    size: "L",
  },
  {
    title: "Floral summer dress",
    description: "Light cotton dress with pockets. Washed and ready to wear.",
    priceRupees: 900,
    condition: ProductCondition.GOOD,
    categorySlug: "clothes",
    size: "S",
  },
  {
    title: "Casio vintage digital watch",
    description: "Runs perfectly, new battery. Small scratches on the strap.",
    priceRupees: 2200,
    condition: ProductCondition.GOOD,
    categorySlug: "watches",
    brand: "Casio",
  },
  {
    title: "Analog field watch",
    description: "Stainless steel case, canvas strap, tested for a week.",
    priceRupees: 3100,
    condition: ProductCondition.LIKE_NEW,
    categorySlug: "watches",
  },
  {
    title: "Leather sling bag",
    description: "Real leather, adjustable strap, two zip pockets. Some wear at the corners.",
    priceRupees: 990,
    condition: ProductCondition.FAIR,
    categorySlug: "bags",
  },
  {
    title: "Canvas backpack, olive",
    description: "Roomy 25L bag with laptop sleeve. All zips work.",
    priceRupees: 1200,
    condition: ProductCondition.GOOD,
    categorySlug: "bags",
  },
  {
    title: "Mechanical keyboard",
    description: "Tenkeyless, brown switches, USB-C cable included.",
    priceRupees: 3500,
    condition: ProductCondition.GOOD,
    categorySlug: "tech",
  },
  {
    title: "Bluetooth headphones",
    description: "Over-ear, good battery life, cushions recently replaced.",
    priceRupees: 2600,
    condition: ProductCondition.GOOD,
    categorySlug: "tech",
  },
  {
    title: "Android phone, 64GB",
    description: "Screen protector since day one, battery health still strong.",
    priceRupees: 11500,
    condition: ProductCondition.GOOD,
    categorySlug: "tech",
  },
  {
    title: "Ceramic mug set of four",
    description: "Hand-glazed mugs, no chips.",
    priceRupees: 550,
    condition: ProductCondition.NEW,
    categorySlug: "other",
  },
  {
    title: "Hardcover novels, set of five",
    description: "Well-kept favourites in English.",
    priceRupees: 750,
    condition: ProductCondition.GOOD,
    categorySlug: "other",
  },
];

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

const seedProducts = async (sellerId: string): Promise<number> => {
  const existingProductCount = await prisma.product.count({ where: { sellerId } });
  if (existingProductCount > 0) {
    return 0;
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  const now = Date.now();
  const products = DEMO_PRODUCTS.flatMap((product, index) => {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      return [];
    }
    return [
      {
        sellerId,
        categoryId,
        title: product.title,
        description: product.description,
        priceMinor: rupeesToPaisa(product.priceRupees),
        condition: product.condition,
        status: ProductStatus.ACTIVE,
        reviewStatus: UNCHECKED_DEMO_PRODUCT_TITLES.includes(product.title)
          ? ProductReviewStatus.PENDING
          : ProductReviewStatus.APPROVED,
        reviewedAt: UNCHECKED_DEMO_PRODUCT_TITLES.includes(product.title) ? null : new Date(),
        brand: product.brand ?? null,
        size: product.size ?? null,
        publishedAt: new Date(now - index * MILLISECONDS_PER_HOUR),
      },
    ];
  });

  const { count } = await prisma.product.createMany({ data: products });
  return count;
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
  const createdProducts = await seedProducts(sellerId);

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
