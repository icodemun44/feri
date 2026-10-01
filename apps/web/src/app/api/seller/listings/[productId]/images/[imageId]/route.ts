import { NextResponse, type NextRequest } from "next/server";
import { AppError, ERROR_CODES } from "@feri/shared";
import { uuidField } from "@feri/validation";
import { listingService } from "@/modules/listings/listing.service";
import { assertActionUser } from "@/server/auth/guards";
import { assertSameOrigin, toErrorResponse } from "@/server/http/route-handler";

type RouteContext = { params: Promise<{ productId: string; imageId: string }> };

export const DELETE = async (request: NextRequest, { params }: RouteContext) => {
  try {
    assertSameOrigin(request);
    const user = await assertActionUser();
    const { productId, imageId } = await params;
    if (!uuidField.safeParse(productId).success || !uuidField.safeParse(imageId).success) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Photo not found.");
    }
    await listingService.removeImage(user, productId, imageId);
    return NextResponse.json({ message: "Photo removed" });
  } catch (error) {
    return toErrorResponse(error);
  }
};
