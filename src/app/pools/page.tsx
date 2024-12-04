import { type Metadata } from "next";
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
      <div className="mx-auto max-w-7xl">
        <PoolListContainer />
      </div>
    </ContentContainer>
  );
}
