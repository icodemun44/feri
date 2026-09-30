import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv, getSupabaseServerUrl } from "../env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = getEnv();

  return createServerClient(getSupabaseServerUrl(), NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: CookieToSet[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          return;
        }
      },
    },
  });
};
