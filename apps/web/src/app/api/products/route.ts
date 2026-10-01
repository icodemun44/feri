import { NextResponse, type NextRequest } from "next/server";
import { productListQuerySchema } from "@feri/validation";
import { catalogService } from "@/modules/catalog/catalog.service";
import { describeError, logger } from "@/server/logger";

const CACHE_CONTROL = "public, max-age=0, s-maxage=30, stale-while-revalidate=60";

export const GET = async (request: NextRequest) => {
  const { category } = productListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  try {
    const products = await catalogService.listLatestProducts(category || undefined);
    return NextResponse.json({ products }, { headers: { "Cache-Control": CACHE_CONTROL } });
  } catch (error) {
    logger.error("Could not load products for category switch", describeError(error));
    return NextResponse.json({ message: "Could not load products" }, { status: 500 });
  }
};
