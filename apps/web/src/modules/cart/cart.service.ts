import "server-only";
import { isUniqueConstraintError } from "@feri/database";
import {
  AppError,
  ERROR_CODES,
  FLAT_DELIVERY_FEE_PAISA,
  hasPermission,
  MAX_CART_ITEMS,
  PERMISSIONS,
} from "@feri/shared";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { cartRepository } from "./cart.repository";
import type { CartLine, CartSellerGroup, CartView } from "./cart.types";

const sumPrices = (lines: readonly CartLine[]): number =>
  lines.reduce((total, line) => total + line.priceMinor, 0);

export const groupLinesBySeller = (lines: readonly CartLine[]): CartSellerGroup[] => {
  const linesBySeller = new Map<string, CartLine[]>();
  lines.forEach((line) => {
    linesBySeller.set(line.sellerId, [...(linesBySeller.get(line.sellerId) ?? []), line]);
  });
  return [...linesBySeller.values()].flatMap((sellerLines) => {
    const [firstLine] = sellerLines;
    if (!firstLine) {
      return [];
    }
    const subtotalMinor = sumPrices(sellerLines);
    return [
      {
        sellerId: firstLine.sellerId,
        sellerName: firstLine.sellerName,
        lines: sellerLines,
        subtotalMinor,
        deliveryFeeMinor: FLAT_DELIVERY_FEE_PAISA,
        totalMinor: subtotalMinor + FLAT_DELIVERY_FEE_PAISA,
      },
    ];
  });
};

const getCart = async (user: AppUser): Promise<CartView> => {
  assertPermission(user, PERMISSIONS.ORDER_PLACE);
  const lines = await cartRepository.listForUser(user.id);
  const availableLines = lines.filter((line) => line.isAvailable);
  const groups = groupLinesBySeller(availableLines);
  return {
    groups,
    unavailableLines: lines.filter((line) => !line.isAvailable),
    availableItemCount: availableLines.length,
    grandTotalMinor: groups.reduce((total, group) => total + group.totalMinor, 0),
  };
};

const countForHeader = async (user: AppUser | null): Promise<number> =>
  user && hasPermission(user.role, PERMISSIONS.ORDER_PLACE) ? cartRepository.count(user.id) : 0;

const isInCart = async (user: AppUser | null, productId: string): Promise<boolean> =>
  user && hasPermission(user.role, PERMISSIONS.ORDER_PLACE)
    ? cartRepository.contains(user.id, productId)
    : false;

const add = async (user: AppUser, productId: string): Promise<void> => {
  assertPermission(user, PERMISSIONS.ORDER_PLACE);

  const product = await cartRepository.findAddableProduct(productId);
  if (!product || !product.isAvailable) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "This item is no longer available.");
  }
  if (product.sellerUserId === user.id) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "You cannot buy your own listing.");
  }
  if ((await cartRepository.count(user.id)) >= MAX_CART_ITEMS) {
    throw new AppError(
      ERROR_CODES.INVALID_STATE,
      `Your cart is full. You can hold up to ${MAX_CART_ITEMS} items.`,
    );
  }

  try {
    await cartRepository.add(user.id, productId);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }
  }
};

const remove = async (user: AppUser, productId: string): Promise<void> => {
  assertPermission(user, PERMISSIONS.ORDER_PLACE);
  await cartRepository.remove(user.id, productId);
};

export const cartService = { getCart, countForHeader, isInCart, add, remove };
