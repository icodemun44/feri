import { ROLES, type Role } from "./roles";

export const PERMISSIONS = {
  CATALOG_READ: "catalog.read",
  ORDER_PLACE: "order.place",
  ORDER_READ_OWN: "order.read.own",
  REVIEW_CREATE: "review.create",
  SELLER_APPLY: "seller.apply",
  SELLER_APPLICATION_READ_OWN: "seller.application.read.own",
  SELLER_APPLICATION_REVIEW: "seller.application.review",
  SELLER_MANAGE: "seller.manage",
  PRODUCT_MANAGE_OWN: "product.manage.own",
  ORDER_FULFILL_OWN: "order.fulfill.own",
  PRODUCT_MODERATE: "product.moderate",
  CATEGORY_MANAGE: "category.manage",
  BANNER_MANAGE: "banner.manage",
  USER_MANAGE: "user.manage",
  PLATFORM_ANALYTICS_READ: "platform.analytics.read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const SIGNED_IN_SHOPPER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.CATALOG_READ,
  PERMISSIONS.ORDER_PLACE,
  PERMISSIONS.ORDER_READ_OWN,
  PERMISSIONS.REVIEW_CREATE,
];

export const ROLE_PERMISSIONS: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  [ROLES.BUYER]: new Set<Permission>([
    ...SIGNED_IN_SHOPPER_PERMISSIONS,
    PERMISSIONS.SELLER_APPLY,
    PERMISSIONS.SELLER_APPLICATION_READ_OWN,
  ]),
  [ROLES.SELLER]: new Set<Permission>([
    ...SIGNED_IN_SHOPPER_PERMISSIONS,
    PERMISSIONS.PRODUCT_MANAGE_OWN,
    PERMISSIONS.ORDER_FULFILL_OWN,
    PERMISSIONS.SELLER_APPLICATION_READ_OWN,
  ]),
  [ROLES.ADMIN]: new Set<Permission>([
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.SELLER_APPLICATION_REVIEW,
    PERMISSIONS.SELLER_MANAGE,
    PERMISSIONS.PRODUCT_MODERATE,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.BANNER_MANAGE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.PLATFORM_ANALYTICS_READ,
  ]),
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role].has(permission);

export const hasAnyPermission = (role: Role, permissions: readonly Permission[]): boolean =>
  permissions.some((permission) => hasPermission(role, permission));
