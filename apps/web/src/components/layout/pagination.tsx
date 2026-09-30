import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FIRST_PAGE } from "@feri/shared";
import { Button } from "@feri/ui";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  queryParameters: Readonly<Record<string, string | undefined>>;
};

const buildPageHref = (
  basePath: string,
  queryParameters: PaginationProps["queryParameters"],
  page: number,
): string => {
  const searchParameters = new URLSearchParams();
  Object.entries(queryParameters).forEach(([name, value]) => {
    if (value) {
      searchParameters.set(name, value);
    }
  });
  if (page > FIRST_PAGE) {
    searchParameters.set("page", String(page));
  }
  const queryString = searchParameters.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

export const Pagination = ({ basePath, page, totalPages, queryParameters }: PaginationProps) => {
  if (totalPages <= FIRST_PAGE) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
      {page > FIRST_PAGE ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={buildPageHref(basePath, queryParameters, page - 1)}>
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Link>
        </Button>
      ) : null}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={buildPageHref(basePath, queryParameters, page + 1)}>
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      ) : null}
    </nav>
  );
};
