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
    <ContentContainer title="Swap Pools" className="bg-transparent">
      <h1 className="flex items-center gap-2 text-5xl font-bold ml-4 my-2">
        Pools
      </h1>

      <PoolListContainer />
    </ContentContainer>
  );
}
