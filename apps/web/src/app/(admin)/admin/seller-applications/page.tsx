import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { SELLER_APPLICATION_STATUSES, type SellerApplicationStatus } from "@feri/shared";
import { Button, cn, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { Pagination } from "@/components/layout/pagination";
import { formatDate } from "@/lib/format";
import { ApplicationStatusBadge } from "@/modules/seller-applications/components/application-status-badge";
import { SELLER_APPLICATION_FILTERS } from "@/modules/seller-applications/seller-application.constants";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { requireAdmin } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Seller applications" };

type SellerApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VALID_STATUSES: readonly string[] = Object.values(SELLER_APPLICATION_STATUSES);

const parseStatus = (value: string | string[] | undefined): SellerApplicationStatus | undefined =>
  typeof value === "string" && VALID_STATUSES.includes(value)
    ? (Object.values(SELLER_APPLICATION_STATUSES).find((status) => status === value) ?? undefined)
    : undefined;

const parsePage = (value: string | string[] | undefined): number | undefined => {
  const page = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(page) ? page : undefined;
};

const SellerApplicationsPage = async ({ searchParams }: SellerApplicationsPageProps) => {
  const admin = await requireAdmin("/admin/seller-applications");
  const rawParameters = await searchParams;
  const status = parseStatus(rawParameters["status"]);
  const applications = await sellerApplicationService.listForAdmin(admin, {
    status,
    page: parsePage(rawParameters["page"]),
  });

  return (
    <>
      <PageHeading
        title="Seller applications"
        description="Oldest first. Open an application, call the applicant, then approve or reject."
      />

      <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-2">
        {SELLER_APPLICATION_FILTERS.map((filter) => {
          const isActive = filter.status === status;
          return (
            <Link
              key={filter.label}
              href={
                filter.status
                  ? `/admin/seller-applications?status=${filter.status}`
                  : "/admin/seller-applications"
              }
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {applications.items.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No applications here"
          description="When someone applies to sell, their application will show up in this list."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Shop
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Applicant
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  City
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Submitted
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {applications.items.map((application) => (
                <tr key={application.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{application.businessName}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{application.applicant.fullName}</p>
                    <p className="text-xs text-muted">{application.contactPhone}</p>
                  </td>
                  <td className="px-4 py-3">{application.city}</td>
                  <td className="px-4 py-3">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/seller-applications/${application.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/seller-applications"
        page={applications.page}
        totalPages={applications.totalPages}
        queryParameters={{ status }}
      />
    </>
  );
};

export default SellerApplicationsPage;
