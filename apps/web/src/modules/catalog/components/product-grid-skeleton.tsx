import { Skeleton } from "@feri/ui";

const SKELETON_CARD_COUNT = 8;
const SKELETON_CARD_KEYS = Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => index);

export const ProductGridSkeleton = () => (
  <ul aria-hidden="true" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
    {SKELETON_CARD_KEYS.map((cardKey) => (
      <li key={cardKey} className="flex flex-col gap-3">
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
      </li>
    ))}
  </ul>
);
