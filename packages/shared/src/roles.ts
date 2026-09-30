export const ROLES = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: readonly Role[] = Object.values(ROLES);

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ALL_ROLES as readonly string[]).includes(value);
