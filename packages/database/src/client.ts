import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "./generated/client";

const MAX_POOL_CONNECTIONS = 10;

declare global {
  var feriPrismaClient: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString, max: MAX_POOL_CONNECTIONS });
  return new PrismaClient({ adapter });
};

const getPrismaClient = (): PrismaClient => {
  globalThis.feriPrismaClient ??= createPrismaClient();
  return globalThis.feriPrismaClient;
};

export const prisma: PrismaClient = new Proxy<PrismaClient>(Object.create(null), {
  get: (_target, property) => {
    const client = getPrismaClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type DbClient = PrismaClient | Prisma.TransactionClient;

export const withTransaction = <Result>(
  work: (transaction: Prisma.TransactionClient) => Promise<Result>,
): Promise<Result> => prisma.$transaction(work);
