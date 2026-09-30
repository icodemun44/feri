import "server-only";
import { isUniqueConstraintError } from "@feri/database";
import { userRepository } from "./user.repository";
import type { AppUser, AuthIdentity } from "./user.types";

const EMAIL_LOCAL_PART_SEPARATOR = "@";

const deriveFullName = (identity: AuthIdentity): string =>
  identity.fullName?.trim() ||
  identity.email.split(EMAIL_LOCAL_PART_SEPARATOR)[0] ||
  identity.email;

const resolveAppUser = async (identity: AuthIdentity): Promise<AppUser> => {
  const existingUser = await userRepository.findByAuthId(identity.authId);
  if (existingUser) {
    return existingUser;
  }

  try {
    return await userRepository.createBuyerFromIdentity({
      ...identity,
      fullName: deriveFullName(identity),
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }
    const concurrentlyCreatedUser = await userRepository.findByAuthId(identity.authId);
    if (concurrentlyCreatedUser) {
      return concurrentlyCreatedUser;
    }
    throw error;
  }
};

export const userService = { resolveAppUser };
