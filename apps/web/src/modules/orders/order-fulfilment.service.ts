import "server-only";
import { OrderStatus, withTransaction, type DbClient } from "@feri/database";
import { AppError, canTransitionOrder, ERROR_CODES, PERMISSIONS } from "@feri/shared";
import type { SellerCancelOrderInput } from "@feri/validation";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditRepository,
} from "@/modules/audit/audit.repository";
import { sellerRepository } from "@/modules/sellers/seller.repository";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { orderRepository } from "./order.repository";
import type { OrderDetail, OrderSummary, SellerOrderCounts, SellerOrderView } from "./order.types";

const STALE_ORDER_MESSAGE =
  "This order was just updated somewhere else. Refresh the page and try again.";
const NOT_FOUND_MESSAGE = "Order not found.";

type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

const resolveSellerId = async (user: AppUser): Promise<string> => {
  assertPermission(user, PERMISSIONS.ORDER_FULFILL_OWN);
  const seller = await sellerRepository.findByUserId(user.id);
  if (!seller) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have a shop.");
  }
  return seller.id;
};

const listForSeller = async (user: AppUser, view: SellerOrderView): Promise<OrderSummary[]> =>
  orderRepository.listForSeller(await resolveSellerId(user), view);

const getForSeller = async (user: AppUser, orderId: string): Promise<OrderDetail> => {
  const order = await orderRepository.findForSeller(orderId, await resolveSellerId(user));
  if (!order) {
    throw new AppError(ERROR_CODES.NOT_FOUND, NOT_FOUND_MESSAGE);
  }
  return order;
};

const countForSeller = async (user: AppUser): Promise<SellerOrderCounts> =>
  orderRepository.countForSeller(await resolveSellerId(user));

type StatusChange = {
  from: OrderStatus;
  to: OrderStatus;
  auditAction: AuditAction;
  extraData?: { deliveredAt?: Date };
  afterChange?: (orderId: string, db: DbClient) => Promise<void>;
};

const changeStatus = async (
  user: AppUser,
  orderId: string,
  { from, to, auditAction, extraData, afterChange }: StatusChange,
): Promise<void> => {
  const sellerId = await resolveSellerId(user);

  await withTransaction(async (db) => {
    const order = await orderRepository.findForSeller(orderId, sellerId, db);
    if (!order) {
      throw new AppError(ERROR_CODES.NOT_FOUND, NOT_FOUND_MESSAGE);
    }
    if (order.status !== from || !canTransitionOrder(from, to)) {
      throw new AppError(ERROR_CODES.INVALID_STATE, "This order cannot move to that step.");
    }

    const changed = await orderRepository.transition(
      { id: orderId, sellerId, from: [from], data: { status: to, ...extraData } },
      db,
    );
    if (!changed) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_ORDER_MESSAGE);
    }
    await afterChange?.(orderId, db);
    await auditRepository.record(
      {
        actorId: user.id,
        action: auditAction,
        entityType: AUDIT_ENTITY_TYPES.ORDER,
        entityId: orderId,
      },
      db,
    );
  });
};

const confirm = (user: AppUser, orderId: string): Promise<void> =>
  changeStatus(user, orderId, {
    from: OrderStatus.PLACED,
    to: OrderStatus.CONFIRMED,
    auditAction: AUDIT_ACTIONS.ORDER_CONFIRMED,
  });

const ship = (user: AppUser, orderId: string): Promise<void> =>
  changeStatus(user, orderId, {
    from: OrderStatus.CONFIRMED,
    to: OrderStatus.SHIPPED,
    auditAction: AUDIT_ACTIONS.ORDER_SHIPPED,
  });

const markDelivered = (user: AppUser, orderId: string): Promise<void> =>
  changeStatus(user, orderId, {
    from: OrderStatus.SHIPPED,
    to: OrderStatus.DELIVERED,
    auditAction: AUDIT_ACTIONS.ORDER_DELIVERED,
    extraData: { deliveredAt: new Date() },
    afterChange: (id, db) => orderRepository.markPaymentCollected(id, db),
  });

const cancelBySeller = async (
  user: AppUser,
  { orderId, reason }: SellerCancelOrderInput,
): Promise<void> => {
  const sellerId = await resolveSellerId(user);

  await withTransaction(async (db) => {
    const order = await orderRepository.findForSeller(orderId, sellerId, db);
    if (!order) {
      throw new AppError(ERROR_CODES.NOT_FOUND, NOT_FOUND_MESSAGE);
    }
    const isCancellable =
      (order.status === OrderStatus.PLACED || order.status === OrderStatus.CONFIRMED) &&
      canTransitionOrder(order.status, OrderStatus.CANCELLED);
    if (!isCancellable) {
      throw new AppError(ERROR_CODES.INVALID_STATE, "This order can no longer be cancelled.");
    }

    const cancelled = await orderRepository.transition(
      {
        id: orderId,
        sellerId,
        from: [order.status],
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      },
      db,
    );
    if (!cancelled) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_ORDER_MESSAGE);
    }

    await orderRepository.markPaymentNotCollected(orderId, db);
    await orderRepository.releaseProducts(await orderRepository.listProductIds(orderId, db), db);
    await auditRepository.record(
      {
        actorId: user.id,
        action: AUDIT_ACTIONS.ORDER_CANCELLED,
        entityType: AUDIT_ENTITY_TYPES.ORDER,
        entityId: orderId,
        metadata: { cancelledBy: "seller", reason },
      },
      db,
    );
  });
};

export const orderFulfilmentService = {
  listForSeller,
  getForSeller,
  countForSeller,
  confirm,
  ship,
  markDelivered,
  cancelBySeller,
};
