import "server-only";
import { describeError, logger } from "@/server/logger";
import { bannerRepository, type BannerView } from "./banner.repository";

const listActiveBannersOrEmpty = async (): Promise<BannerView[]> => {
  try {
    return await bannerRepository.listActive(new Date());
  } catch (error) {
    logger.error("Could not load home page banners", describeError(error));
    return [];
  }
};

export const bannerService = { listActiveBannersOrEmpty };
