import "server-only";
import { OrderStatus, withTransaction } from "@feri/database";
import { AppError, canTransitionOrder, ERROR_CODES, PERMISSIONS } from "@feri/shared";
import type { CheckoutInput } from "@feri/validation";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditRepository,
} from "@/modules/audit/audit.repository";
import { cartRepository } from "@/modules/cart/cart.repository";
import { groupLinesBySeller } from "@/modules/cart/cart.service";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { orderRepository } from "./order.repository";
import type { OrderDetail, OrderSummary, PlacedOrder } from "./order.types";

const EMPTY_CART_MESSAGE = "Your cart is empty.";
const UNAVAILABLE_ITEMS_MESSAGE =
  "Some items in your cart are no longer available. Remove them and try again.";
const JUST_SOLD_MESSAGE =
  "Someone else just bought one of these items. Check your cart and try again.";
const NOT_CANCELLABLE_MESSAGE = "This order can no longer be cancelled.";

const placeFromCart = async (user: AppUser, shipping: CheckoutInput): Promise<PlacedOrder[]> => {
  assertPermission(user, PERMISSIONS.ORDER_PLACE);

  return withTransaction(async (db) => {
    const lines = await cartRepository.listForUser(user.id, db);
    if (lines.length === 0) {
      throw new AppError(ERROR_CODES.INVALID_STATE, EMPTY_CART_MESSAGE);
    }
    const hasUnavailableLine = lines.some(
      (line) => !line.isAvailable || line.sellerUserId === user.id,
    );
    if (hasUnavailableLine) {
      throw new AppError(ERROR_CODES.CONFLICT, UNAVAILABLE_ITEMS_MESSAGE);
    }

    const reservedCount = await orderRepository.reserveProducts(
      lines.map((line) => line.productId),
      db,
    );
    if (reservedCount !== lines.length) {
      throw new AppError(ERROR_CODES.CONFLICT, JUST_SOLD_MESSAGE);
    }

    const placedOrders: PlacedOrder[] = [];
    for (const group of groupLinesBySeller(lines)) {
      const placedOrder = await orderRepository.create(
        {
          buyerId: user.id,
          sellerId: group.sellerId,
          subtotalMinor: group.subtotalMinor,
          deliveryFeeMinor: group.deliveryFeeMinor,
          shipping,
          items: group.lines.map((line) => ({
            productId: line.productId,
            title: line.title,
            priceMinor: line.priceMinor,
          })),
        },
        db,
      );
      await auditRepository.record(
        {
          actorId: user.id,
          action: AUDIT_ACTIONS.ORDER_PLACED,
          entityType: AUDIT_ENTITY_TYPES.ORDER,
          entityId: placedOrder.id,
        },
        db,
      );
      placedOrders.push(placedOrder);
    }

    await cartRepository.clear(user.id, db);
    return placedOrders;
  });
};

const listMine = (user: AppUser): Promise<OrderSummary[]> => {
  assertPermission(user, PERMISSIONS.ORDER_READ_OWN);
  return orderRepository.listForBuyer(user.id);
};

const getMine = async (user: AppUser, orderId: string): Promise<OrderDetail> => {
  assertPermission(user, PERMISSIONS.ORDER_READ_OWN);
  const order = await orderRepository.findForBuyer(orderId, user.id);
  if (!order) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Order not found.");
  }
  return order;
};

const cancelMine = async (user: AppUser, orderId: string): Promise<void> => {
  assertPermission(user, PERMISSIONS.ORDER_READ_OWN);

  await withTransaction(async (db) => {
    const order = await orderRepository.findForBuyer(orderId, user.id, db);
    if (!order) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Order not found.");
    }
    const isCancellableByBuyer =
      order.status === OrderStatus.PLACED &&
      canTransitionOrder(order.status, OrderStatus.CANCELLED);
    if (!isCancellableByBuyer) {
      throw new AppError(ERROR_CODES.INVALID_STATE, NOT_CANCELLABLE_MESSAGE);
    }

    const cancelled = await orderRepository.transition(
      {
        id: orderId,
        buyerId: user.id,
        from: [OrderStatus.PLACED],
        data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
      },
      db,
    );
    if (!cancelled) {
      throw new AppError(ERROR_CODES.CONFLICT, NOT_CANCELLABLE_MESSAGE);
    }

    await orderRepository.markPaymentNotCollected(orderId, db);
    await orderRepository.releaseProducts(await orderRepository.listProductIds(orderId, db), db);
    await auditRepository.record(
      {
        actorId: user.id,
        action: AUDIT_ACTIONS.ORDER_CANCELLED,
        entityType: AUDIT_ENTITY_TYPES.ORDER,
        entityId: orderId,
      },
      db,
    );
  });
};

export const orderService = { placeFromCart, listMine, getMine, cancelMine };
