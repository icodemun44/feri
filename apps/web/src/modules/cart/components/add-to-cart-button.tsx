"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { addToCartAction } from "../cart.actions";

type AddToCartButtonProps = {
  productId: string;
  isInCart: boolean;
};

const InCartNotice = () => (
  <div className="flex flex-col gap-2">
    <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
      <Check aria-hidden="true" className="size-4" />
      In your cart
    </p>
    <Button asChild size="lg" variant="accent">
      <Link href="/cart">View cart</Link>
    </Button>
  </div>
);

export const AddToCartButton = ({ productId, isInCart }: AddToCartButtonProps) => {
  const [result, addToCart] = useActionState(addToCartAction, null);

  if (isInCart || result?.ok) {
    return <InCartNotice />;
  }

  return (
    <form action={addToCart} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton size="lg" variant="accent" fullWidth>
        Add to cart
      </SubmitButton>
      <p className="text-xs text-muted">Pay when your order arrives. Cash on delivery.</p>
    </form>
  );
};
