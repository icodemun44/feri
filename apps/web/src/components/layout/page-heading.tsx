import type { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeading = ({ title, description, action }: PageHeadingProps) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl">{title}</h1>
      {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
    </div>
    {action}
  </div>
);
