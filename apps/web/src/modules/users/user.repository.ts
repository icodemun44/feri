import "server-only";
import { prisma, type Prisma, Role, type DbClient } from "@feri/database";
import type { AppUser, AuthIdentity } from "./user.types";

const userWithProfile = { include: { profile: true } } satisfies Prisma.UserDefaultArgs;

type UserWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;

const toAppUser = ({ profile, ...user }: UserWithProfile): AppUser => ({
  id: user.id,
  authId: user.authId,
  email: user.email,
  role: user.role,
  fullName: profile?.fullName ?? user.email,
  phone: profile?.phone ?? null,
  suspendedAt: user.suspendedAt,
});

const findByAuthId = async (authId: string, db: DbClient = prisma): Promise<AppUser | null> => {
  const user = await db.user.findUnique({ where: { authId }, ...userWithProfile });
  return user ? toAppUser(user) : null;
};

const createBuyerFromIdentity = async (
  identity: AuthIdentity & { fullName: string },
  db: DbClient = prisma,
): Promise<AppUser> => {
  const user = await db.user.create({
    data: {
      authId: identity.authId,
      email: identity.email.toLowerCase(),
      role: Role.BUYER,
      profile: { create: { fullName: identity.fullName, phone: identity.phone ?? null } },
    },
    ...userWithProfile,
  });
  return toAppUser(user);
};

const promoteBuyerToSeller = async (userId: string, db: DbClient = prisma): Promise<boolean> => {
  const { count } = await db.user.updateMany({
    where: { id: userId, role: Role.BUYER },
    data: { role: Role.SELLER },
  });
  return count === 1;
};

export const userRepository = { findByAuthId, createBuyerFromIdentity, promoteBuyerToSeller };
