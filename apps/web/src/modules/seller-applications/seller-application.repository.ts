import "server-only";
import { prisma, type Prisma, type SellerApplicationStatus, type DbClient } from "@feri/database";
import {
  buildPaginatedResult,
  SELLER_APPLICATION_STATUSES,
  type PaginatedResult,
  type PaginationWindow,
} from "@feri/shared";
import type {
  SellerApplicationRecord,
  SellerApplicationStatusCounts,
} from "./seller-application.types";

const applicationInclusion = {
  primaryCategory: { select: { id: true, name: true } },
  applicant: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
  reviewer: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
} satisfies Prisma.SellerApplicationInclude;

type ApplicationRow = Prisma.SellerApplicationGetPayload<{ include: typeof applicationInclusion }>;

type PersonRow = { id: string; email: string; profile: { fullName: string } | null };

const toPerson = ({ id, email, profile }: PersonRow) => ({
  id,
  email,
  fullName: profile?.fullName ?? email,
});

const toRecord = (row: ApplicationRow): SellerApplicationRecord => ({
  id: row.id,
  status: row.status,
  businessName: row.businessName,
  description: row.description,
  contactEmail: row.contactEmail,
  contactPhone: row.contactPhone,
  city: row.city,
  primaryCategory: row.primaryCategory,
  applicant: toPerson(row.applicant),
  reviewer: row.reviewer
    ? { id: row.reviewer.id, fullName: toPerson(row.reviewer).fullName }
    : null,
  reviewStartedAt: row.reviewStartedAt,
  verificationCallAt: row.verificationCallAt,
  verificationNotes: row.verificationNotes,
  decidedAt: row.decidedAt,
  decisionReason: row.decisionReason,
  createdAt: row.createdAt,
});

type CreateApplicationInput = {
  applicantId: string;
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  primaryCategoryId?: string | undefined;
};

const create = async (
  input: CreateApplicationInput,
  db: DbClient = prisma,
): Promise<SellerApplicationRecord> => {
  const { primaryCategoryId, ...fields } = input;
  const row = await db.sellerApplication.create({
    data: { ...fields, ...(primaryCategoryId ? { primaryCategoryId } : {}) },
    include: applicationInclusion,
  });
  return toRecord(row);
};

const findById = async (
  id: string,
  db: DbClient = prisma,
): Promise<SellerApplicationRecord | null> => {
  const row = await db.sellerApplication.findUnique({
    where: { id },
    include: applicationInclusion,
  });
  return row ? toRecord(row) : null;
};

const findLatestByApplicant = async (
  applicantId: string,
  db: DbClient = prisma,
): Promise<SellerApplicationRecord | null> => {
  const row = await db.sellerApplication.findFirst({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
    include: applicationInclusion,
  });
  return row ? toRecord(row) : null;
};

type ListApplicationsInput = {
  status: SellerApplicationStatus | undefined;
  window: PaginationWindow;
};

const list = async (
  { status, window }: ListApplicationsInput,
  db: DbClient = prisma,
): Promise<PaginatedResult<SellerApplicationRecord>> => {
  const where: Prisma.SellerApplicationWhereInput = status ? { status } : {};
  const [rows, totalItems] = await Promise.all([
    db.sellerApplication.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: window.skip,
      take: window.take,
      include: applicationInclusion,
    }),
    db.sellerApplication.count({ where }),
  ]);
  return buildPaginatedResult(rows.map(toRecord), totalItems, window);
};

const countByStatus = async (db: DbClient = prisma): Promise<SellerApplicationStatusCounts> => {
  const groups = await db.sellerApplication.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: SellerApplicationStatusCounts = {
    [SELLER_APPLICATION_STATUSES.PENDING]: 0,
    [SELLER_APPLICATION_STATUSES.IN_REVIEW]: 0,
    [SELLER_APPLICATION_STATUSES.APPROVED]: 0,
    [SELLER_APPLICATION_STATUSES.REJECTED]: 0,
  };
  groups.forEach((group) => {
    counts[group.status] = group._count._all;
  });
  return counts;
};

type TransitionInput = {
  id: string;
  from: readonly SellerApplicationStatus[];
  data: Prisma.SellerApplicationUncheckedUpdateManyInput;
};

const transition = async (
  { id, from, data }: TransitionInput,
  db: DbClient = prisma,
): Promise<boolean> => {
  const { count } = await db.sellerApplication.updateMany({
    where: { id, status: { in: [...from] } },
    data,
  });
  return count === 1;
};

const activeCategoryExists = async (
  categoryId: string,
  db: DbClient = prisma,
): Promise<boolean> => {
  const category = await db.category.findFirst({
    where: { id: categoryId, isActive: true },
    select: { id: true },
  });
  return category !== null;
};

export const sellerApplicationRepository = {
  create,
  findById,
  findLatestByApplicant,
  list,
  countByStatus,
  transition,
  activeCategoryExists,
};
