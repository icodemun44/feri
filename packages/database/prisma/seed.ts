import { BannerTone } from "../src/generated/enums";
import { prisma } from "../src/client";

const CATEGORIES = [
  {
    name: "Clothes",
    slug: "clothes",
    description: "Jackets, dresses, shirts and everyday wear with plenty of life left.",
  },
  {
    name: "Watches",
    slug: "watches",
    description: "Pre-owned wrist watches, from vintage classics to daily wearers.",
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Backpacks, totes and sling bags carefully checked by their sellers.",
  },
  {
    name: "Tech",
    slug: "tech",
    description: "Phones, keyboards, audio gear and accessories that still work beautifully.",
  },
  {
    name: "Other",
    slug: "other",
    description: "Home goods, books and other finds that deserve a second home.",
  },
] as const;

const BANNERS = [
  {
    title: "Good things deserve a second home",
    subtitle: "Shop pre-loved clothes, watches, bags and tech from sellers we have verified.",
    ctaLabel: "Start browsing",
    ctaHref: "/products",
    tone: BannerTone.UMBER,
  },
  {
    title: "Pay when it arrives",
    subtitle: "Cash on delivery on every order. Check your find first, then pay.",
    ctaLabel: "See what is new",
    ctaHref: "/products",
    tone: BannerTone.CLAY,
  },
  {
    title: "Turn your closet into cash",
    subtitle: "Apply to become a seller. We will call you to verify and get you set up.",
    ctaLabel: "Become a seller",
    ctaHref: "/sell",
    tone: BannerTone.INK,
  },
] as const;

const seedCategories = async (): Promise<void> => {
  for (const [sortOrder, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder },
      create: { ...category, sortOrder },
    });
  }
};

const seedBanners = async (): Promise<void> => {
  const existingBannerCount = await prisma.banner.count();
  if (existingBannerCount > 0) {
    return;
  }
  await prisma.banner.createMany({
    data: BANNERS.map((banner, sortOrder) => ({ ...banner, sortOrder })),
  });
};

const main = async (): Promise<void> => {
  await seedCategories();
  await seedBanners();
  console.log("Seeded categories and banners");
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
