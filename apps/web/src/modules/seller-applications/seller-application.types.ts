import type { SellerApplicationStatus } from "@feri/shared";

export type SellerApplicationRecord = {
  id: string;
  status: SellerApplicationStatus;
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  primaryCategory: { id: string; name: string } | null;
  applicant: { id: string; email: string; fullName: string };
  reviewer: { id: string; fullName: string } | null;
  reviewStartedAt: Date | null;
  verificationCallAt: Date | null;
  verificationNotes: string | null;
  decidedAt: Date | null;
  decisionReason: string | null;
  createdAt: Date;
};

export type SellerApplicationStatusCounts = Record<SellerApplicationStatus, number>;
