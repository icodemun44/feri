import "server-only";
import {
  isUniqueConstraintError,
  type SellerApplicationStatus,
  withTransaction,
  type DbClient,
} from "@feri/database";
import {
  AppError,
  canTransitionSellerApplication,
  ERROR_CODES,
  PERMISSIONS,
  resolvePaginationWindow,
  SELLER_APPLICATION_STATUSES,
  type PaginatedResult,
} from "@feri/shared";
import type {
  ApproveSellerApplicationInput,
  RecordVerificationCallInput,
  RejectSellerApplicationInput,
  SubmitSellerApplicationInput,
} from "@feri/validation";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditRepository,
} from "@/modules/audit/audit.repository";
import { sellerRepository } from "@/modules/sellers/seller.repository";
import { sellerService } from "@/modules/sellers/seller.service";
import { userRepository } from "@/modules/users/user.repository";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { sellerApplicationRepository } from "./seller-application.repository";
import type {
  SellerApplicationRecord,
  SellerApplicationStatusCounts,
} from "./seller-application.types";

const { PENDING, IN_REVIEW, APPROVED, REJECTED } = SELLER_APPLICATION_STATUSES;

const STALE_APPLICATION_MESSAGE =
  "This application was just updated by someone else. Refresh the page and try again.";

const loadApplicationOrThrow = async (
  applicationId: string,
  db?: DbClient,
): Promise<SellerApplicationRecord> => {
  const application = await sellerApplicationRepository.findById(applicationId, db);
  if (!application) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
  }
  return application;
};

const ensureTransitionAllowed = (
  from: SellerApplicationStatus,
  to: SellerApplicationStatus,
): void => {
  if (!canTransitionSellerApplication(from, to)) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "This application cannot move to that step.");
  }
};

const submit = async (
  applicant: AppUser,
  input: SubmitSellerApplicationInput,
): Promise<SellerApplicationRecord> => {
  assertPermission(applicant, PERMISSIONS.SELLER_APPLY);

  if (input.primaryCategoryId) {
    const categoryIsValid = await sellerApplicationRepository.activeCategoryExists(
      input.primaryCategoryId,
    );
    if (!categoryIsValid) {
      throw new AppError(ERROR_CODES.VALIDATION, "Choose a valid category.", {
        fieldErrors: { primaryCategoryId: ["Choose a valid category."] },
      });
    }
  }

  try {
    return await withTransaction(async (db) => {
      const application = await sellerApplicationRepository.create(
        { ...input, applicantId: applicant.id },
        db,
      );
      await auditRepository.record(
        {
          actorId: applicant.id,
          action: AUDIT_ACTIONS.SELLER_APPLICATION_SUBMITTED,
          entityType: AUDIT_ENTITY_TYPES.SELLER_APPLICATION,
          entityId: application.id,
        },
        db,
      );
      return application;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(ERROR_CODES.CONFLICT, "You already have an application under review.");
    }
    throw error;
  }
};

const startReview = async (admin: AppUser, applicationId: string): Promise<void> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  await withTransaction(async (db) => {
    const application = await loadApplicationOrThrow(applicationId, db);
    ensureTransitionAllowed(application.status, IN_REVIEW);

    const moved = await sellerApplicationRepository.transition(
      {
        id: applicationId,
        from: [PENDING],
        data: { status: IN_REVIEW, reviewerId: admin.id, reviewStartedAt: new Date() },
      },
      db,
    );
    if (!moved) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_APPLICATION_MESSAGE);
    }
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.SELLER_APPLICATION_REVIEW_STARTED,
        entityType: AUDIT_ENTITY_TYPES.SELLER_APPLICATION,
        entityId: applicationId,
      },
      db,
    );
  });
};

const recordVerificationCall = async (
  admin: AppUser,
  { applicationId, notes }: RecordVerificationCallInput,
): Promise<void> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  await withTransaction(async (db) => {
    const application = await loadApplicationOrThrow(applicationId, db);
    if (application.status !== IN_REVIEW) {
      throw new AppError(
        ERROR_CODES.INVALID_STATE,
        "Start the review before recording the verification call.",
      );
    }

    const updated = await sellerApplicationRepository.transition(
      {
        id: applicationId,
        from: [IN_REVIEW],
        data: { verificationCallAt: new Date(), verificationNotes: notes, reviewerId: admin.id },
      },
      db,
    );
    if (!updated) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_APPLICATION_MESSAGE);
    }
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.SELLER_APPLICATION_CALL_RECORDED,
        entityType: AUDIT_ENTITY_TYPES.SELLER_APPLICATION,
        entityId: applicationId,
      },
      db,
    );
  });
};

const approve = async (
  admin: AppUser,
  { applicationId, approvalNote }: ApproveSellerApplicationInput,
): Promise<void> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  await withTransaction(async (db) => {
    const application = await loadApplicationOrThrow(applicationId, db);
    ensureTransitionAllowed(application.status, APPROVED);
    if (!application.verificationCallAt) {
      throw new AppError(
        ERROR_CODES.INVALID_STATE,
        "Record the verification call before approving this application.",
      );
    }

    const approved = await sellerApplicationRepository.transition(
      {
        id: applicationId,
        from: [IN_REVIEW],
        data: {
          status: APPROVED,
          reviewerId: admin.id,
          decidedAt: new Date(),
          decisionReason: approvalNote ?? null,
        },
      },
      db,
    );
    if (!approved) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_APPLICATION_MESSAGE);
    }

    const promoted = await userRepository.promoteBuyerToSeller(application.applicant.id, db);
    if (!promoted) {
      throw new AppError(ERROR_CODES.INVALID_STATE, "The applicant is not a buyer account.");
    }

    await sellerRepository.create(
      {
        userId: application.applicant.id,
        applicationId,
        slug: await sellerService.generateUniqueSlug(application.businessName, db),
        businessName: application.businessName,
        description: application.description,
        contactEmail: application.contactEmail,
        contactPhone: application.contactPhone,
        city: application.city,
      },
      db,
    );

    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.SELLER_APPLICATION_APPROVED,
        entityType: AUDIT_ENTITY_TYPES.SELLER_APPLICATION,
        entityId: applicationId,
        metadata: { applicantId: application.applicant.id },
      },
      db,
    );
  });
};

const reject = async (
  admin: AppUser,
  { applicationId, reason }: RejectSellerApplicationInput,
): Promise<void> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  await withTransaction(async (db) => {
    const application = await loadApplicationOrThrow(applicationId, db);
    ensureTransitionAllowed(application.status, REJECTED);

    const rejected = await sellerApplicationRepository.transition(
      {
        id: applicationId,
        from: [application.status],
        data: {
          status: REJECTED,
          reviewerId: admin.id,
          decidedAt: new Date(),
          decisionReason: reason,
        },
      },
      db,
    );
    if (!rejected) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_APPLICATION_MESSAGE);
    }
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.SELLER_APPLICATION_REJECTED,
        entityType: AUDIT_ENTITY_TYPES.SELLER_APPLICATION,
        entityId: applicationId,
      },
      db,
    );
  });
};

const getLatestForApplicant = (applicant: AppUser): Promise<SellerApplicationRecord | null> => {
  assertPermission(applicant, PERMISSIONS.SELLER_APPLICATION_READ_OWN);
  return sellerApplicationRepository.findLatestByApplicant(applicant.id);
};

type AdminListInput = { status: SellerApplicationStatus | undefined; page: number | undefined };

const listForAdmin = (
  admin: AppUser,
  { status, page }: AdminListInput,
): Promise<PaginatedResult<SellerApplicationRecord>> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  return sellerApplicationRepository.list({ status, window: resolvePaginationWindow({ page }) });
};

const getForAdmin = async (
  admin: AppUser,
  applicationId: string,
): Promise<SellerApplicationRecord> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  return loadApplicationOrThrow(applicationId);
};

const countForAdmin = (admin: AppUser): Promise<SellerApplicationStatusCounts> => {
  assertPermission(admin, PERMISSIONS.SELLER_APPLICATION_REVIEW);
  return sellerApplicationRepository.countByStatus();
};

export const sellerApplicationService = {
  submit,
  startReview,
  recordVerificationCall,
  approve,
  reject,
  getLatestForApplicant,
  listForAdmin,
  getForAdmin,
  countForAdmin,
};
