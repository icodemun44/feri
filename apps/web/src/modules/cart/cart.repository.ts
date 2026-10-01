import "server-only";
import { prisma, type Prisma, ProductStatus, SellerStatus, type DbClient } from "@feri/database";
import { buildPublicProductImageUrl } from "@/server/supabase/storage";
import type { AddableProduct, CartLine } from "./cart.types";

const productSelection = {
  id: true,
  title: true,
  priceMinor: true,
  status: true,
  quantity: true,
  category: { select: { slug: true } },
  seller: { select: { id: true, businessName: true, status: true, userId: true } },
  images: { orderBy: { position: "asc" }, take: 1, select: { storagePath: true } },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelection }>;

const isPurchasable = (product: Pick<ProductRow, "status" | "quantity" | "seller">): boolean =>
  product.status === ProductStatus.ACTIVE &&
  product.quantity > 0 &&
  product.seller.status === SellerStatus.ACTIVE;

const toLine = (product: ProductRow): CartLine => {
  const [coverImage] = product.images;
  return {
    productId: product.id,
    title: product.title,
    priceMinor: product.priceMinor,
    categorySlug: product.category.slug,
    imageUrl: coverImage ? buildPublicProductImageUrl(coverImage.storagePath) : null,
    sellerId: product.seller.id,
    sellerUserId: product.seller.userId,
    sellerName: product.seller.businessName,
    isAvailable: isPurchasable(product),
  };
};

const listForUser = async (userId: string, db: DbClient = prisma): Promise<CartLine[]> => {
  const rows = await db.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { product: { select: productSelection } },
  });
  return rows.map((row) => toLine(row.product));
};

const count = (userId: string, db: DbClient = prisma): Promise<number> =>
  db.cartItem.count({ where: { userId } });

const findAddableProduct = async (
  productId: string,
  db: DbClient = prisma,
): Promise<AddableProduct | null> => {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: productSelection,
  });
  return product
    ? { id: product.id, isAvailable: isPurchasable(product), sellerUserId: product.seller.userId }
    : null;
};

const contains = async (
  userId: string,
  productId: string,
  db: DbClient = prisma,
): Promise<boolean> => {
  const item = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return item !== null;
};

const add = async (userId: string, productId: string, db: DbClient = prisma): Promise<void> => {
  await db.cartItem.create({ data: { userId, productId } });
};

const remove = async (userId: string, productId: string, db: DbClient = prisma): Promise<void> => {
  await db.cartItem.deleteMany({ where: { userId, productId } });
};

const clear = async (userId: string, db: DbClient = prisma): Promise<void> => {
  await db.cartItem.deleteMany({ where: { userId } });
};

export const cartRepository = {
  listForUser,
  count,
  contains,
  findAddableProduct,
  add,
  remove,
  clear,
};
