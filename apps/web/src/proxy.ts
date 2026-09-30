import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@feri/shared";
import { buildLoginPath } from "@/lib/safe-redirect";
import { getEnv, getSupabaseServerUrl } from "@/server/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const proxy = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = getEnv();

  const supabase = createServerClient(
    getSupabaseServerUrl(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  if (!data.user && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL(buildLoginPath(`${pathname}${search}`), request.url));
  }

  return response;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
