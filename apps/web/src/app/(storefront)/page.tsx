import { Container } from "@feri/ui";
import { bannerService } from "@/modules/banners/banner.service";
import { HeroCarousel } from "@/modules/banners/components/hero-carousel";
import { catalogService } from "@/modules/catalog/catalog.service";
import { CategoryProductShowcase } from "@/modules/catalog/components/category-product-showcase";

const BUYING_PROMISES = [
  {
    lead: "Every seller gets a phone call.",
    detail:
      "Our team calls each seller to check who they are before their first listing goes live.",
  },
  {
    lead: "Pay when it arrives.",
    detail:
      "Open the parcel, check the item, then pay the courier. Every order is cash on delivery.",
  },
  {
    lead: "Prices in rupees.",
    detail: "Listings come from sellers in Nepal, priced the way you would pay for them.",
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

      <section aria-labelledby="buying-promises-heading" className="mt-6">
        <h2 id="buying-promises-heading" className="sr-only">
          How buying works
        </h2>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {BUYING_PROMISES.map(({ lead, detail }) => (
            <div key={lead} className="flex flex-col gap-2 border-t-2 border-primary pt-4">
              <dt className="text-lg font-semibold text-ink">{lead}</dt>
              <dd className="max-w-xs text-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Container>
  );
};

export default HomePage;
