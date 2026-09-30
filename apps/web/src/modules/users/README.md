# users

**Purpose:** the application's own user record (role, profile, suspension) that sits next to the Supabase Auth identity.

**Structure**

- `user.types.ts` - `AppUser` (what the rest of the app sees) and `AuthIdentity` (what we know from Supabase).
- `user.repository.ts` - Prisma access. Maps database rows to `AppUser`.
- `user.service.ts` - `resolveAppUser` finds the user for an auth identity, creating a BUYER on first sight.

**Funnel**

- User flow: sign up or log in, open any page, and the account simply exists. There is no separate "finish setting up your profile" step.
- Technical flow: `getCurrentUser()` (`server/auth/session.ts`) -> `userService.resolveAppUser` -> `userRepository` -> database.

**Non-obvious rationale**

- Users are created lazily on their first authenticated request instead of in a signup hook. That keeps Supabase Auth and our database loosely coupled: a user who confirms their email days later still gets a record.
- Every new user is created as `BUYER`. A role is never read from the client or from auth metadata. Only the seller application approval (`seller-applications`) or the admin script can change it.
- If two requests race to create the same user, the unique constraint on `auth_id` rejects one and the other result is re-read.
