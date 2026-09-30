"use client";

import { TriangleAlert } from "lucide-react";
import { Button, Container, EmptyState } from "@feri/ui";

type ErrorPageProps = {
  reset: () => void;
};

const ErrorPage = ({ reset }: ErrorPageProps) => (
  <main>
    <Container className="py-20">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="We could not load this page. Please try again in a moment."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Container>
  </main>
);

export default ErrorPage;
