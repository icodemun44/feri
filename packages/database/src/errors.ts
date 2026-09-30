import { Prisma } from "./generated/client";

const UNIQUE_CONSTRAINT_VIOLATION_CODE = "P2002";

export const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE;
