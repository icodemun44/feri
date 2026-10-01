import "server-only";
import { createClient } from "@supabase/supabase-js";
import { AppError, ERROR_CODES } from "@feri/shared";
import { getEnv, getSupabaseServerUrl } from "../env";

const PRODUCT_IMAGE_BUCKET = "product-images";

export const buildPublicProductImageUrl = (storagePath: string): string =>
  `${getEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${storagePath}`;

const openProductImageBucket = () => {
  const { SUPABASE_SECRET_KEY } = getEnv();
  if (!SUPABASE_SECRET_KEY) {
    throw new AppError(ERROR_CODES.INTERNAL, "Photo uploads are not available right now.");
  }
  return createClient(getSupabaseServerUrl(), SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).storage.from(PRODUCT_IMAGE_BUCKET);
};

const uploadProductImage = async (
  storagePath: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> => {
  const { error } = await openProductImageBucket().upload(storagePath, bytes, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new AppError(ERROR_CODES.INTERNAL, "We could not save that photo. Please try again.");
  }
};

const removeProductImages = async (storagePaths: readonly string[]): Promise<void> => {
  if (storagePaths.length === 0) {
    return;
  }
  await openProductImageBucket().remove([...storagePaths]);
};

export const productImageStorage = { upload: uploadProductImage, remove: removeProductImages };
