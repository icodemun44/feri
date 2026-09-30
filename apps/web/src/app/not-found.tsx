import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button, Container, EmptyState } from "@feri/ui";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const NotFoundPage = () => (
  <>
    <SiteHeader />
    <main>
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title="We could not find that page"
          description="The link may be old, or the item may have been sold or removed."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      </Container>
    </main>
    <SiteFooter />
  </>
);

export default NotFoundPage;
