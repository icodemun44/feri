import Link from "next/link";
import { BadgeCheck, HandCoins, MapPin } from "lucide-react";
import { Container } from "@feri/ui";
import { bannerService } from "@/modules/banners/banner.service";
import { HeroCarousel } from "@/modules/banners/components/hero-carousel";
import { catalogService } from "@/modules/catalog/catalog.service";
import { CategoryChips } from "@/modules/catalog/components/category-chips";
import { ProductGrid } from "@/modules/catalog/components/product-grid";

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

const HomePage = async () => {
  const [banners, categories, latestProducts] = await Promise.all([
    bannerService.listActiveBannersOrEmpty(),
    catalogService.listCategories(),
    catalogService.listLatestProducts(),
  ]);

  return (
    <Container className="flex flex-col gap-10 py-6 sm:py-8">
      <HeroCarousel slides={banners} />

      <CategoryChips categories={categories} />

      <section aria-labelledby="latest-heading" className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="text-2xl">
            Fresh finds
          </h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            See everything
          </Link>
        </div>
        <ProductGrid products={latestProducts} />
      </section>

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
