import { parseArgs } from "node:util";
import { prisma, Role } from "@feri/database";
import { MIN_PASSWORD_LENGTH } from "@feri/shared";
import { createAdminClient, ensureUser } from "./lib/auth-users";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    password: { type: "string" },
    name: { type: "string", default: "Feri Nepal Admin" },
  },
});

const main = async (): Promise<void> => {
  const { email, password, name } = values;
  if (!email || !password) {
    throw new Error(
      "Usage: pnpm admin:create -- --email you@example.com --password '...' [--name 'Full Name']",
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const user = await ensureUser(createAdminClient(), {
    email,
    password,
    fullName: name ?? "Feri Nepal Admin",
    role: Role.ADMIN,
  });
  console.log(`Admin ready: ${email} (user ${user.id})`);
};

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
