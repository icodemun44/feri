import "server-only";
import { notFound, redirect } from "next/navigation";
import {
  AppError,
  ERROR_CODES,
  hasPermission,
  ROLES,
  type Permission,
  type Role,
} from "@feri/shared";
import type { AppUser } from "@/modules/users/user.types";
import { buildLoginPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "./session";

type RoleRequirementOptions = {
  nextPath?: string;
  deniedRedirectTo?: string;
};

export const requireUser = async (nextPath?: string): Promise<AppUser> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(buildLoginPath(nextPath));
  }
  return user;
};

export const requireRole = async (
  allowedRoles: readonly Role[],
  { nextPath, deniedRedirectTo }: RoleRequirementOptions = {},
): Promise<AppUser> => {
  const user = await requireUser(nextPath);
  if (allowedRoles.includes(user.role)) {
    return user;
  }
  if (deniedRedirectTo) {
    redirect(deniedRedirectTo);
  }
  notFound();
};

export const requireAdmin = (nextPath?: string): Promise<AppUser> =>
  requireRole([ROLES.ADMIN], nextPath ? { nextPath } : {});

export const requireSeller = (nextPath?: string): Promise<AppUser> =>
  requireRole([ROLES.SELLER], { deniedRedirectTo: "/sell", ...(nextPath ? { nextPath } : {}) });

export const assertActionUser = async (): Promise<AppUser> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHENTICATED, "Please log in to continue.");
  }
  return user;
};

export const assertActionPermission = async (permission: Permission): Promise<AppUser> => {
  const user = await assertActionUser();
  if (!hasPermission(user.role, permission)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to do that.");
  }
  return user;
};
