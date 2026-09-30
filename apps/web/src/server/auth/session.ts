import "server-only";
import { cache } from "react";
import { userService } from "@/modules/users/user.service";
import type { AppUser } from "@/modules/users/user.types";
import { createSupabaseServerClient } from "../supabase/server-client";

type AuthenticatedIdentity = {
  authId: string;
  email: string;
  fullName: string | undefined;
  phone: string | undefined;
};

const readMetadataText = (metadata: Record<string, unknown>, key: string): string | undefined => {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const getAuthenticatedIdentity = cache(async (): Promise<AuthenticatedIdentity | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    return null;
  }
  const { id, email, user_metadata: metadata } = data.user;
  return {
    authId: id,
    email,
    fullName: readMetadataText(metadata, "full_name"),
    phone: readMetadataText(metadata, "phone"),
  };
});

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return null;
  }
  const appUser = await userService.resolveAppUser(identity);
  return appUser.suspendedAt ? null : appUser;
});
