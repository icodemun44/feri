# Supabase clients

**Purpose:** create Supabase clients for the server. The app only uses Supabase for authentication (and later file storage). All business data goes through Prisma.

**Structure**

- `server-client.ts` - cookie-aware client used in Server Components, Server Actions and Route Handlers.
- The session refresh for every request happens in `src/proxy.ts`.

**Non-obvious rationale**

- `setAll` swallows the error thrown when cookies are written from a Server Component (Next.js only allows cookie writes in Actions and Route Handlers). The proxy refreshes the session on every request, so nothing is lost.
- `SUPABASE_INTERNAL_URL` lets the server reach Supabase through a different hostname than the browser (for example `host.docker.internal` inside Docker) while `NEXT_PUBLIC_SUPABASE_URL` stays the public address.
- The secret (service role) key is never used in request handling. It is only used by the scripts in `apps/web/scripts`.
