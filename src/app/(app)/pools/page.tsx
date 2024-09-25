import { type Metadata } from "next";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { PoolListContainer } from "~/components/pools/pools-page";

export const metadata: Metadata = {
  title: "Swap Pools",
  description: "Explore and join swap pools available on the network.",
  openGraph: {
    title: "Swap Pools",
    description: "Explore and join swap pools available on the network.",
  },
};

export default function PoolsPage() {
  return (
    <ContentContainer title="Swap Pools">
      <BreadcrumbResponsive
        items={[{ label: "Home", href: "/" }, { label: "Pools" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <PoolListContainer />
      </div>
    </ContentContainer>
  );
}
