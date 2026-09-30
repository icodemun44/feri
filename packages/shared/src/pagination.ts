import { DEFAULT_PAGE_SIZE, FIRST_PAGE, MAX_PAGE_SIZE } from "./constants";

export type PaginationInput = {
  page?: number | undefined;
  pageSize?: number | undefined;
};

export type PaginationWindow = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export type PaginatedResult<Item> = {
  items: Item[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const toPositiveInteger = (value: number | undefined, fallback: number): number =>
  value !== undefined && Number.isInteger(value) && value >= FIRST_PAGE ? value : fallback;

export const resolvePaginationWindow = ({ page, pageSize }: PaginationInput): PaginationWindow => {
  const resolvedPage = toPositiveInteger(page, FIRST_PAGE);
  const resolvedPageSize = Math.min(toPositiveInteger(pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  return {
    page: resolvedPage,
    pageSize: resolvedPageSize,
    skip: (resolvedPage - FIRST_PAGE) * resolvedPageSize,
    take: resolvedPageSize,
  };
};

export const buildPaginatedResult = <Item>(
  items: Item[],
  totalItems: number,
  window: PaginationWindow,
): PaginatedResult<Item> => ({
  items,
  page: window.page,
  pageSize: window.pageSize,
  totalItems,
  totalPages: Math.max(FIRST_PAGE, Math.ceil(totalItems / window.pageSize)),
});
