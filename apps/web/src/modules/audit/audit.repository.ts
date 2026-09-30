import "server-only";
import { prisma, type Prisma, type DbClient } from "@feri/database";

export const AUDIT_ACTIONS = {
  SELLER_APPLICATION_SUBMITTED: "seller_application.submitted",
  SELLER_APPLICATION_REVIEW_STARTED: "seller_application.review_started",
  SELLER_APPLICATION_CALL_RECORDED: "seller_application.call_recorded",
  SELLER_APPLICATION_APPROVED: "seller_application.approved",
  SELLER_APPLICATION_REJECTED: "seller_application.rejected",
} as const;

export const AUDIT_ENTITY_TYPES = {
  SELLER_APPLICATION: "seller_application",
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
