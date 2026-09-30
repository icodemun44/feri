# auth

**Purpose:** sign up, log in and log out with Supabase Auth.

**Structure**

- `auth.actions.ts` - `signUpAction`, `signInAction`, `signOutAction` (Server Actions).
- `auth.errors.ts` - turns Supabase auth error codes into short, safe messages.
- `components/` - `LoginForm` and `SignUpForm` (client components using `useActionState`).
- `src/app/auth/confirm/route.ts` - the link target for email confirmation emails.

**Funnel**

- User flow: sign up (name, email, mobile, password) -> land on `/account` (or confirm by email first when confirmations are enabled) -> log in later with email and password.
- Technical flow: form -> server action -> Zod validation -> Supabase Auth -> session cookie -> `src/proxy.ts` refreshes it on every request -> `getCurrentUser()` resolves the application user.

**Non-obvious rationale**

- Only the Supabase session lives in cookies. Roles and permissions always come from our own `users` table, never from auth metadata the client can influence.
- The `next` redirect parameter is validated by `toSafeRedirectPath` so a crafted link cannot send people to another site.
- Error messages are mapped, not passed through, so raw Supabase or database messages never reach the page.
- Local Supabase has email confirmation turned off so sign-up logs you in immediately. Turn confirmations on in production (`enable_confirmations` in the Supabase project settings).
