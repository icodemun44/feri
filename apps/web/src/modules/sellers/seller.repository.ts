import "server-only";
import { prisma, SellerStatus, type DbClient } from "@feri/database";

export type SellerRecord = {
  id: string;
  userId: string;
  slug: string;
  businessName: string;
  status: SellerStatus;
};

type CreateSellerInput = {
  userId: string;
  applicationId: string;
  slug: string;
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
};

const sellerSelection = {
  id: true,
  userId: true,
  slug: true,
  businessName: true,
  status: true,
} as const;

const findByUserId = (userId: string, db: DbClient = prisma): Promise<SellerRecord | null> =>
  db.seller.findUnique({ where: { userId }, select: sellerSelection });

const slugExists = async (slug: string, db: DbClient = prisma): Promise<boolean> => {
  const existingSeller = await db.seller.findUnique({ where: { slug }, select: { id: true } });
  return existingSeller !== null;
};

const create = (input: CreateSellerInput, db: DbClient = prisma): Promise<SellerRecord> =>
  db.seller.create({ data: { ...input, status: SellerStatus.ACTIVE }, select: sellerSelection });

export const sellerRepository = { findByUserId, slugExists, create };
