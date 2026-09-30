import type { Metadata } from "next";
import Link from "next/link";
import { ROLES, getInitials } from "@feri/shared";
import { Badge, Button, Card, CardContent, Container } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { signOutAction } from "@/modules/auth/auth.actions";
import { requireUser } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Your account" };

const ROLE_LABELS = {
  [ROLES.BUYER]: "Buyer",
  [ROLES.SELLER]: "Seller",
  [ROLES.ADMIN]: "Administrator",
} as const;

const AccountPage = async () => {
  const user = await requireUser("/account");

  return (
    <Container className="max-w-3xl py-8">
      <PageHeading title="Your account" />

      <div className="flex flex-col gap-5">
        <Card>
          <CardContent className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white"
            >
              {getInitials(user.fullName)}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate text-lg font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              {user.phone ? <p className="text-sm text-muted">{user.phone}</p> : null}
            </div>
            <Badge tone="primary" className="ml-auto">
              {ROLE_LABELS[user.role]}
            </Badge>
          </CardContent>
        </Card>

        {user.role === ROLES.BUYER ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg">Have things to sell?</h2>
                <p className="max-w-md text-sm text-muted">
                  Apply to become a seller. We review every application and call you to verify
                  before you can list.
                </p>
              </div>
              <Button asChild variant="accent">
                <Link href="/sell">Become a seller</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {user.role === ROLES.SELLER ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg">Your shop</h2>
                <p className="text-sm text-muted">Manage your listings and orders.</p>
              </div>
              <Button asChild>
                <Link href="/seller">Open seller dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {user.role === ROLES.ADMIN ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg">Administration</h2>
                <p className="text-sm text-muted">
                  Review seller applications and manage the store.
                </p>
              </div>
              <Button asChild>
                <Link href="/admin">Open admin</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Log out
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default AccountPage;
