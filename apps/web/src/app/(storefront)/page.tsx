import { BadgeCheck, HandCoins, MapPin } from "lucide-react";
import { Container } from "@feri/ui";
import { bannerService } from "@/modules/banners/banner.service";
import { HeroCarousel } from "@/modules/banners/components/hero-carousel";
import { catalogService } from "@/modules/catalog/catalog.service";
import { CategoryProductShowcase } from "@/modules/catalog/components/category-product-showcase";

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: "Sellers verified by phone",
    description: "Every seller is reviewed and called by our team before they can list.",
  },
  {
    icon: HandCoins,
    title: "Pay on delivery",
    description: "Check your find first, then pay. Cash on delivery on every order.",
  },
  {
    icon: MapPin,
    title: "Made for Nepal",
    description: "Local sellers, prices in rupees and delivery across the country.",
  },
] as const;

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const HomePage = async ({ searchParams }: HomePageProps) => {
  const { category } = await searchParams;
  const [banners, categories] = await Promise.all([
    bannerService.listActiveBannersOrEmpty(),
    catalogService.listCategories(),
  ]);
  const initialCategorySlug = categories.find((candidate) => candidate.slug === category)?.slug;
  const initialProducts = await catalogService.listLatestProducts(initialCategorySlug);

  return (
    <Container className="flex flex-col gap-10 py-6 sm:py-8">
      <HeroCarousel slides={banners} />

      <CategoryProductShowcase
        categories={categories}
        initialCategorySlug={initialCategorySlug}
        initialProducts={initialProducts}
      />

      <section aria-label="Why shop with us">
        <ul className="grid gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="text-base">{title}</h3>
              <p className="text-sm text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
};

export default HomePage;
