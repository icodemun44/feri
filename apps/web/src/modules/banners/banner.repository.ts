import "server-only";
import { prisma, type BannerTone, type DbClient } from "@feri/database";

export type BannerView = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: BannerTone;
};

const listActive = (now: Date, db: DbClient = prisma): Promise<BannerView[]> =>
  db.banner.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, subtitle: true, ctaLabel: true, ctaHref: true, tone: true },
  });

export const bannerRepository = { listActive };
