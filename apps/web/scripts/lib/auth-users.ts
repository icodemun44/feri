import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { prisma, type Role } from "@feri/database";

const AUTH_USERS_PAGE_SIZE = 200;

export const createAdminClient = (): SupabaseClient => {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const secretKey = process.env["SUPABASE_SECRET_KEY"];
  if (!url || !secretKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env");
  }
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
};

const findAuthUserIdByEmail = async (
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> => {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: AUTH_USERS_PAGE_SIZE,
  });
  if (error) {
    throw error;
  }
  return data.users.find((user) => user.email?.toLowerCase() === email)?.id ?? null;
};

type EnsureUserInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: Role;
};

export const ensureUser = async (
  supabase: SupabaseClient,
  { email, password, fullName, phone, role }: EnsureUserInput,
): Promise<{ id: string; authId: string }> => {
  const normalizedEmail = email.toLowerCase();
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, ...(phone ? { phone } : {}) },
  });

  let authId = data.user?.id ?? null;
  if (error) {
    authId = await findAuthUserIdByEmail(supabase, normalizedEmail);
    if (!authId) {
      throw error;
    }
  }
  if (!authId) {
    throw new Error("Supabase did not return a user id");
  }

  const user = await prisma.user.upsert({
    where: { authId },
    update: { role },
    create: {
      authId,
      email: normalizedEmail,
      role,
      profile: { create: { fullName, phone: phone ?? null } },
    },
    select: { id: true },
  });
  return { id: user.id, authId };
};
