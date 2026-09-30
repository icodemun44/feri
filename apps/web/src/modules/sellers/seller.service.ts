import "server-only";
import { randomBytes } from "node:crypto";
import type { DbClient } from "@feri/database";
import { slugify } from "@feri/shared";
import { sellerRepository } from "./seller.repository";

const SLUG_SUFFIX_BYTES = 3;
const MAX_SLUG_ATTEMPTS = 5;

const generateUniqueSlug = async (businessName: string, db: DbClient): Promise<string> => {
  const baseSlug = slugify(businessName);
  if (!(await sellerRepository.slugExists(baseSlug, db))) {
    return baseSlug;
  }
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidateSlug = `${baseSlug}-${randomBytes(SLUG_SUFFIX_BYTES).toString("hex")}`;
    if (!(await sellerRepository.slugExists(candidateSlug, db))) {
      return candidateSlug;
    }
  }
  throw new Error("Could not generate a unique seller slug");
};

export const sellerService = { generateUniqueSlug };
