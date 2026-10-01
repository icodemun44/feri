"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@feri/ui";
import { removeFromCartAction } from "../cart.actions";

export const RemoveFromCartButton = ({ productId }: { productId: string }) => {
  const [, removeFromCart, isPending] = useActionState(removeFromCartAction, null);

  return (
    <form action={removeFromCart}>
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" variant="ghost" size="sm" isLoading={isPending}>
        <Trash2 aria-hidden="true" className="size-4" />
        Remove
      </Button>
    </form>
  );
};
