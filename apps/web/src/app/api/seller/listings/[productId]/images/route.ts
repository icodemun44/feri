import { NextResponse, type NextRequest } from "next/server";
import { AppError, ERROR_CODES, MAX_PRODUCT_IMAGE_BYTES } from "@feri/shared";
import { uuidField } from "@feri/validation";
import { listingService } from "@/modules/listings/listing.service";
import { assertActionUser } from "@/server/auth/guards";
import { assertSameOrigin, toErrorResponse } from "@/server/http/route-handler";

const PHOTO_FIELD_NAME = "photo";

type RouteContext = { params: Promise<{ productId: string }> };

export const POST = async (request: NextRequest, { params }: RouteContext) => {
  try {
    assertSameOrigin(request);
    const user = await assertActionUser();
    const { productId } = await params;
    if (!uuidField.safeParse(productId).success) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    const formData = await request.formData();
    const photo = formData.get(PHOTO_FIELD_NAME);
    if (!(photo instanceof File)) {
      throw new AppError(ERROR_CODES.VALIDATION, "Choose a photo to upload.");
    }
    if (photo.size > MAX_PRODUCT_IMAGE_BYTES) {
      throw new AppError(ERROR_CODES.VALIDATION, "Each photo must be under 5 MB.");
    }

    const bytes = new Uint8Array(await photo.arrayBuffer());
    await listingService.addImage(user, productId, { bytes, originalName: photo.name });
    return NextResponse.json({ message: "Photo added" }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
};
