import type { Role } from "@feri/shared";

export type AppUser = {
  id: string;
  authId: string;
  email: string;
  role: Role;
  fullName: string;
  phone: string | null;
  suspendedAt: Date | null;
};

export type AuthIdentity = {
  authId: string;
  email: string;
  fullName: string | undefined;
  phone: string | undefined;
};
