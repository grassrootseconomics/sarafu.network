"use client";
import { useState } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { TabsContent } from "~/components/ui/tabs";
import VoucherForm from "~/components/voucher/forms/voucher-form";
import { VoucherHoldersTable } from "~/components/voucher/voucher-holders-table";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { type VoucherDetails } from "../pools/contract-functions";
import { ReportList } from "../reports/report-list";
import { VoucherAnalyticsTab } from "./voucher-analytics-tab";
import { VoucherHeroSection } from "./voucher-hero-section";
import { VoucherHomeTab } from "./voucher-home-tab";
import { VoucherPoolsTab } from "./voucher-pools-tab";
import { VoucherTabs } from "./voucher-tabs";

const VoucherPage = ({
  address,
  details,
}: {
  address: `0x${string}`;
  details: VoucherDetails;
}) => {
  const voucher_address = address;
  const isOwner = useIsContractOwner(voucher_address);
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: voucher_address },
    {
      enabled: !!voucher_address,
      staleTime: 60_000,
    }
  );
  const [activeTab, setActiveTab] = useState("home");

  return (
    <ContentContainer
      title={details?.name ?? "Voucher Details"}
      className="bg-transparent"
    >
      <VoucherHeroSection address={voucher_address} details={details} />
      <VoucherTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwner={isOwner}
      >
        <TabsContent value="home" className="p-0 m-0">
          <VoucherHomeTab voucherAddress={voucher_address} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="pools" className="p-0 m-0">
          <VoucherPoolsTab voucherAddress={voucher_address} />
        </TabsContent>

        <TabsContent value="reports" className="p-0 m-0">
          <ReportList
            query={{
              vouchers: [voucher_address],
            }}
          />
        </TabsContent>

        <TabsContent value="data" className="p-0 m-0">
          <VoucherAnalyticsTab
            voucherAddress={voucher_address}
            details={details}
          />
        </TabsContent>

        <TabsContent value="transactions" className="p-0 m-0 bg-white">
          <div className="grid grid-cols-1 w-full overflow-hidden">
            <TransactionsTable voucherAddress={voucher_address} />
          </div>
        </TabsContent>

        <TabsContent value="holders" className="p-0 m-0 bg-white">
          <div className="grid grid-cols-1 w-full overflow-hidden">
            <VoucherHoldersTable voucherAddress={voucher_address} />
          </div>
        </TabsContent>

        <TabsContent value="update" className="p-0 m-0">
          <VoucherForm voucherAddress={voucher_address} metadata={voucher} />
        </TabsContent>
      </VoucherTabs>
    </ContentContainer>
  );
};

export default VoucherPage;
