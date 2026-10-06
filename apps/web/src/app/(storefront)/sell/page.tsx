import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, PhoneCall, Store } from "lucide-react";
import { ROLES, SELLER_APPLICATION_STATUSES } from "@feri/shared";
import { Alert, Button, Container } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Become a seller" };

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us about your shop",
    description:
      "Fill in a short application with your shop name, what you sell and your phone number.",
  },
  {
    icon: PhoneCall,
    title: "We call you",
    description:
      "A team member calls to confirm your details. It usually takes one or two working days.",
  },
  {
    icon: Store,
    title: "Start selling",
    description: "Once approved you get a seller dashboard to list items and manage orders.",
  },
] as const;

const resolveCallToAction = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { href: "/signup?next=/sell/apply", label: "Create an account to apply", notice: null };
  }
  if (user.role === ROLES.SELLER) {
    return { href: "/seller", label: "Open your seller dashboard", notice: null };
  }
  if (user.role === ROLES.ADMIN) {
    return { href: "/admin", label: "Go to admin", notice: "Administrator accounts cannot sell." };
  }

  const application = await sellerApplicationService.getLatestForApplicant(user);
  const hasOpenApplication =
    application?.status === SELLER_APPLICATION_STATUSES.PENDING ||
    application?.status === SELLER_APPLICATION_STATUSES.IN_REVIEW;
  if (hasOpenApplication) {
    return { href: "/sell/status", label: "See your application", notice: null };
  }
  return { href: "/sell/apply", label: "Apply to sell", notice: null };
};

const SellPage = async () => {
  const { href, label, notice } = await resolveCallToAction();

  return (
    <Container className="max-w-4xl py-8">
      <PageHeading
        title="Sell on Feri Nepal"
        description="Give your pre-loved clothes, watches, bags and tech a second home. We verify every seller so buyers can shop with confidence."
      />

      {notice ? (
        <Alert tone="info" className="mb-6">
          {notice}
        </Alert>
      ) : null}

      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-lg">
              {index + 1}. {title}
            </h2>
            <p className="text-sm text-muted">{description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Button asChild size="lg">
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </Container>
  );
};

export default SellPage;
