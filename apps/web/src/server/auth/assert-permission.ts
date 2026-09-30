import { AppError, ERROR_CODES, hasPermission, type Permission } from "@feri/shared";
import type { AppUser } from "@/modules/users/user.types";

export const assertPermission = (user: AppUser, permission: Permission): void => {
  if (!hasPermission(user.role, permission)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to do that.");
  }
};
