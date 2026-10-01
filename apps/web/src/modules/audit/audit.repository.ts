import "server-only";
import { prisma, type Prisma, type DbClient } from "@feri/database";

export const AUDIT_ACTIONS = {
  SELLER_APPLICATION_SUBMITTED: "seller_application.submitted",
  SELLER_APPLICATION_REVIEW_STARTED: "seller_application.review_started",
  SELLER_APPLICATION_CALL_RECORDED: "seller_application.call_recorded",
  SELLER_APPLICATION_APPROVED: "seller_application.approved",
  SELLER_APPLICATION_REJECTED: "seller_application.rejected",
  PRODUCT_CREATED: "product.created",
  PRODUCT_PUBLISHED: "product.published",
  PRODUCT_APPROVED: "product.approved",
  PRODUCT_REMOVED: "product.removed",
  ORDER_PLACED: "order.placed",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
  ORDER_CANCELLED: "order.cancelled",
} as const;

export const AUDIT_ENTITY_TYPES = {
  SELLER_APPLICATION: "seller_application",
  PRODUCT: "product",
  ORDER: "order",
} as const;

type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[keyof typeof AUDIT_ENTITY_TYPES];

type AuditEntry = {
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonObject;
};

const record = async (entry: AuditEntry, db: DbClient = prisma): Promise<void> => {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      ...(entry.metadata ? { metadata: entry.metadata } : {}),
    },
  });
};

export const auditRepository = { record };
