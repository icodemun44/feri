import { z } from "zod";

const emptyToUndefined = (value: unknown): unknown => (value === "" ? undefined : value);

const environmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_INTERNAL_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  SUPABASE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
});

export type Environment = z.infer<typeof environmentSchema>;

let cachedEnvironment: Environment | undefined;

export const getEnv = (): Environment => {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const invalidVariables = Object.keys(z.flattenError(parsed.error).fieldErrors).join(", ");
    throw new Error(`Invalid environment configuration. Check: ${invalidVariables}`);
  }
  cachedEnvironment = parsed.data;
  return cachedEnvironment;
};

export const getSupabaseServerUrl = (): string => {
  const { SUPABASE_INTERNAL_URL, NEXT_PUBLIC_SUPABASE_URL } = getEnv();
  return SUPABASE_INTERNAL_URL ?? NEXT_PUBLIC_SUPABASE_URL;
};
