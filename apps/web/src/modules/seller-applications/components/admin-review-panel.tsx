"use client";

import { useActionState } from "react";
import { PhoneCall } from "lucide-react";
import { SELLER_APPLICATION_STATUSES, type SellerApplicationStatus } from "@feri/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Textarea,
} from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  approveSellerApplicationAction,
  recordVerificationCallAction,
  rejectSellerApplicationAction,
  startSellerApplicationReviewAction,
} from "../seller-application.actions";

type AdminReviewPanelProps = {
  applicationId: string;
  status: SellerApplicationStatus;
  contactPhone: string;
  verificationNotes: string | null;
  hasVerificationCall: boolean;
};

const StartReviewForm = ({ applicationId }: { applicationId: string }) => {
  const [result, startReview] = useActionState(startSellerApplicationReviewAction, null);
  return (
    <form action={startReview} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <SubmitButton>Start review</SubmitButton>
    </form>
  );
};

type VerificationCallFormProps = {
  applicationId: string;
  contactPhone: string;
  verificationNotes: string | null;
};

const VerificationCallForm = ({
  applicationId,
  contactPhone,
  verificationNotes,
}: VerificationCallFormProps) => {
  const [result, recordCall] = useActionState(recordVerificationCallAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={recordCall} className="flex flex-col gap-4">
      <a
        href={`tel:${contactPhone}`}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-strong hover:bg-accent/30"
      >
        <PhoneCall aria-hidden="true" className="size-4" />
        Call {contactPhone}
      </a>
      <ActionMessage result={result} successMessage="Call notes saved." />
      <input type="hidden" name="applicationId" value={applicationId} />
      <FormField
        name="notes"
        label="What did the applicant confirm?"
        hint="Identity, shop details and what they plan to sell."
        errors={fieldErrors["notes"]}
        required
      >
        <Textarea
          defaultValue={submittedValues["notes"] ?? verificationNotes ?? ""}
          maxLength={1000}
        />
      </FormField>
      <SubmitButton variant="secondary">Save call notes</SubmitButton>
    </form>
  );
};

const ApproveForm = ({
  applicationId,
  canApprove,
}: {
  applicationId: string;
  canApprove: boolean;
}) => {
  const [result, approve] = useActionState(approveSellerApplicationAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={approve} className="flex flex-col gap-4">
      <ActionMessage result={result} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <FormField
        name="approvalNote"
        label="Note for the record (optional)"
        errors={fieldErrors["approvalNote"]}
      >
        <Textarea
          defaultValue={submittedValues["approvalNote"] ?? ""}
          className="min-h-20"
          maxLength={500}
        />
      </FormField>
      <SubmitButton disabled={!canApprove}>Approve as seller</SubmitButton>
      {canApprove ? null : (
        <p className="text-xs text-muted">Save the call notes before approving.</p>
      )}
    </form>
  );
};

const RejectForm = ({ applicationId }: { applicationId: string }) => {
  const [result, reject] = useActionState(rejectSellerApplicationAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={reject} className="flex flex-col gap-4">
      <ActionMessage result={result} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <FormField
        name="reason"
        label="Reason shown to the applicant"
        errors={fieldErrors["reason"]}
        required
      >
        <Textarea
          defaultValue={submittedValues["reason"] ?? ""}
          className="min-h-20"
          maxLength={500}
        />
      </FormField>
      <SubmitButton variant="danger">Reject application</SubmitButton>
    </form>
  );
};

export const AdminReviewPanel = ({
  applicationId,
  status,
  contactPhone,
  verificationNotes,
  hasVerificationCall,
}: AdminReviewPanelProps) => {
  const isPending = status === SELLER_APPLICATION_STATUSES.PENDING;
  const isInReview = status === SELLER_APPLICATION_STATUSES.IN_REVIEW;

  if (!isPending && !isInReview) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {isPending ? (
        <Card>
          <CardHeader>
            <CardTitle>Start the review</CardTitle>
            <CardDescription>
              Claim this application. Next you will call the applicant to verify their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartReviewForm applicationId={applicationId} />
          </CardContent>
        </Card>
      ) : null}

      {isInReview ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>1. Verify by phone</CardTitle>
              <CardDescription>
                Call the applicant, then write down what they confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationCallForm
                applicationId={applicationId}
                contactPhone={contactPhone}
                verificationNotes={verificationNotes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Approve</CardTitle>
              <CardDescription>
                The applicant becomes a seller and gets access to the seller dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApproveForm applicationId={applicationId} canApprove={hasVerificationCall} />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Reject</CardTitle>
          <CardDescription>The applicant will see your reason and can apply again.</CardDescription>
        </CardHeader>
        <CardContent>
          <RejectForm applicationId={applicationId} />
        </CardContent>
      </Card>
    </div>
  );
};
