import { type Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "~/components/layout/content-container";
import { MarketplacePage } from "~/components/marketplace/marketplace-page";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Discover pools near you and swap community asset vouchers on the Sarafu Network.",
  openGraph: {
    title: "Marketplace",
    description:
      "Discover pools near you and swap community asset vouchers on the Sarafu Network.",
  },
};

export default function HomePage() {
  return (
    <ContentContainer title="Marketplace" className="bg-transparent">
      <div className="flex flex-col gap-2 mt-2 ml-4">
        <h1 className="flex items-center gap-2 text-4xl sm:text-5xl font-bold">
          Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore pools near you.{" "}
          <Link href="/about" className="underline hover:text-foreground">
            Learn about the Sarafu Network
          </Link>
          .
        </p>
      </div>
      <MarketplacePage />
    </ContentContainer>
  );
}
