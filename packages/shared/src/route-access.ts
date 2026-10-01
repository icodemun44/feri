import { ROLES, type Role } from "./roles";

export type RouteAccessRule = {
  readonly pathPrefix: string;
  readonly allowedRoles: readonly Role[];
};

export const PROTECTED_ROUTE_RULES: readonly RouteAccessRule[] = [
  { pathPrefix: "/admin", allowedRoles: [ROLES.ADMIN] },
  { pathPrefix: "/seller", allowedRoles: [ROLES.SELLER] },
  { pathPrefix: "/account", allowedRoles: [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN] },
  { pathPrefix: "/cart", allowedRoles: [ROLES.BUYER, ROLES.SELLER] },
  { pathPrefix: "/checkout", allowedRoles: [ROLES.BUYER, ROLES.SELLER] },
  { pathPrefix: "/orders", allowedRoles: [ROLES.BUYER, ROLES.SELLER] },
  { pathPrefix: "/sell/apply", allowedRoles: [ROLES.BUYER] },
  { pathPrefix: "/sell/status", allowedRoles: [ROLES.BUYER, ROLES.SELLER] },
];

const matchesPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const findRouteAccessRule = (pathname: string): RouteAccessRule | undefined =>
  [...PROTECTED_ROUTE_RULES]
    .sort((first, second) => second.pathPrefix.length - first.pathPrefix.length)
    .find((rule) => matchesPrefix(pathname, rule.pathPrefix));

export const isProtectedPath = (pathname: string): boolean =>
  findRouteAccessRule(pathname) !== undefined;

export const canRoleAccessPath = (role: Role, pathname: string): boolean => {
  const rule = findRouteAccessRule(pathname);
  return rule === undefined || rule.allowedRoles.includes(role);
};
