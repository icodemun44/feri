import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ROLES, SELLER_APPLICATION_STATUSES } from "@feri/shared";
import { Alert, Button, Card, CardContent, Container, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { formatDate } from "@/lib/format";
import { ApplicationStatusBadge } from "@/modules/seller-applications/components/application-status-badge";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { requireRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Your seller application" };

const STATUS_MESSAGES = {
  [SELLER_APPLICATION_STATUSES.PENDING]:
    "Thanks for applying. Our team will pick up your application soon and call the number you provided.",
  [SELLER_APPLICATION_STATUSES.IN_REVIEW]:
    "A team member is reviewing your application. Please keep your phone nearby, we will call you to verify your details.",
  [SELLER_APPLICATION_STATUSES.APPROVED]: "You are approved. Your seller dashboard is ready.",
  [SELLER_APPLICATION_STATUSES.REJECTED]:
    "We could not approve this application. You can read the reason below and apply again.",
} as const;

const SellerApplicationStatusPage = async () => {
  const user = await requireRole([ROLES.BUYER, ROLES.SELLER], { nextPath: "/sell/status" });
  const application = await sellerApplicationService.getLatestForApplicant(user);

  if (!application) {
    return (
      <Container className="max-w-2xl py-8">
        <EmptyState
          icon={ClipboardList}
          title="You have not applied yet"
          description="Apply to become a seller and start listing your items."
          action={
            <Button asChild>
              <Link href="/sell/apply">Apply to sell</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const { status } = application;

  return (
    <Container className="max-w-2xl py-8">
      <PageHeading title="Your seller application" />

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-ink">{application.businessName}</p>
              <p className="text-sm text-muted">Submitted {formatDate(application.createdAt)}</p>
            </div>
            <ApplicationStatusBadge status={status} />
          </div>

          <p className="text-body">{STATUS_MESSAGES[status]}</p>

          {status === SELLER_APPLICATION_STATUSES.REJECTED && application.decisionReason ? (
            <Alert tone="warning" title="Reason from our team">
              {application.decisionReason}
            </Alert>
          ) : null}

          {status === SELLER_APPLICATION_STATUSES.APPROVED ? (
            <div>
              <Button asChild>
                <Link href="/seller">Open seller dashboard</Link>
              </Button>
            </div>
          ) : null}

          {status === SELLER_APPLICATION_STATUSES.REJECTED && user.role === ROLES.BUYER ? (
            <div>
              <Button asChild>
                <Link href="/sell/apply">Apply again</Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SellerApplicationStatusPage;
