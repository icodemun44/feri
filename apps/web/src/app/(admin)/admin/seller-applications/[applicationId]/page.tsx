import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppError, ERROR_CODES, SELLER_APPLICATION_STATUSES } from "@feri/shared";
import { uuidField } from "@feri/validation";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@feri/ui";
import { formatDateTime } from "@/lib/format";
import { AdminReviewPanel } from "@/modules/seller-applications/components/admin-review-panel";
import { ApplicationStatusBadge } from "@/modules/seller-applications/components/application-status-badge";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { requireAdmin } from "@/server/auth/guards";
import type { SellerApplicationRecord } from "@/modules/seller-applications/seller-application.types";

export const metadata: Metadata = { title: "Review application" };

type ApplicationPageProps = {
  params: Promise<{ applicationId: string }>;
};

const loadApplication = async (
  applicationId: string,
  path: string,
): Promise<SellerApplicationRecord> => {
  const admin = await requireAdmin(path);
  if (!uuidField.safeParse(applicationId).success) {
    notFound();
  }
  try {
    return await sellerApplicationService.getForAdmin(admin, applicationId);
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
    <dd className="text-ink">{value}</dd>
  </div>
);

const ApplicationReviewPage = async ({ params }: ApplicationPageProps) => {
  const { applicationId } = await params;
  const application = await loadApplication(
    applicationId,
    `/admin/seller-applications/${applicationId}`,
  );
  const isApproved = application.status === SELLER_APPLICATION_STATUSES.APPROVED;

  return (
    <>
      <Link
        href="/admin/seller-applications"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All applications
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{application.businessName}</h1>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Applicant" value={application.applicant.fullName} />
                <DetailRow label="Account email" value={application.applicant.email} />
                <DetailRow label="Contact email" value={application.contactEmail} />
                <DetailRow label="Contact phone" value={application.contactPhone} />
                <DetailRow label="City" value={application.city} />
                <DetailRow
                  label="Main category"
                  value={application.primaryCategory?.name ?? "Not specified"}
                />
                <DetailRow label="Submitted" value={formatDateTime(application.createdAt)} />
                {application.reviewer ? (
                  <DetailRow label="Reviewer" value={application.reviewer.fullName} />
                ) : null}
              </dl>
              <div className="mt-5 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  What they plan to sell
                </p>
                <p className="whitespace-pre-line text-ink">{application.description}</p>
              </div>
            </CardContent>
          </Card>

          {application.verificationCallAt ? (
            <Card>
              <CardHeader>
                <CardTitle>Verification call</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted">
                  Recorded {formatDateTime(application.verificationCallAt)}
                </p>
                <p className="whitespace-pre-line text-ink">{application.verificationNotes}</p>
              </CardContent>
            </Card>
          ) : null}

          {application.decidedAt ? (
            <Alert
              tone={isApproved ? "success" : "warning"}
              title={`${isApproved ? "Approved" : "Rejected"} on ${formatDateTime(application.decidedAt)}`}
            >
              {application.decisionReason}
            </Alert>
          ) : null}
        </div>

        <AdminReviewPanel
          applicationId={application.id}
          status={application.status}
          contactPhone={application.contactPhone}
          verificationNotes={application.verificationNotes}
          hasVerificationCall={application.verificationCallAt !== null}
        />
      </div>
    </>
  );
};

export default ApplicationReviewPage;
