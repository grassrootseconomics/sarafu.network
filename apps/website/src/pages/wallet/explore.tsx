import type { Session } from "@grassroots/auth";
import React from "react";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { sessionOptions } from "@grassroots/auth";
import { getIronSession } from "iron-session";

import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { Loading } from "~/components/loading";
import { PoolList } from "~/components/pools/pool-list";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherList } from "~/components/voucher/voucher-list";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<Session>(req, res, sessionOptions);
  const user = session.user;
  if (user === undefined) {
    res.setHeader("location", "/");
    res.statusCode = 302;
    res.end();
    return {
      props: {},
    };
  }
  return {
    props: {},
  };
};

const WalletPage = () => {
  const auth = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (!auth?.user) {
      router.push("/").catch(console.error);
    }
  }, [auth?.user]);
  const { data: vouchers } = api.voucher.list.useQuery();
  const [search, setSearch] = React.useState("");
  const filteredVouchers = React.useMemo(
    () =>
      vouchers?.filter(
        (voucher) =>
          voucher.voucher_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.location_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.symbol?.toLowerCase().includes(search.toLowerCase()),
      ),
    [vouchers, search],
  );
  if (!auth?.user) {
    return <Loading />;
  }
  return (
    <ContentContainer title="Explore">
      <BreadcrumbResponsive
        items={[
          {
            label: "Wallet",
            href: "/wallet",
          },
          { label: "Explore" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-lg flex-grow flex-col px-1 sm:px-2">
        <div className="pb-2 pt-4 text-center text-3xl font-semibold">
          Explore
        </div>
        <div>
          <Tabs defaultValue="vouchers" className="max-h-full">
            <TabsList className="mx-auto my-2 mb-4 grid w-fit grid-cols-2">
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="pools">Pools</TabsTrigger>
            </TabsList>
            <TabsContent className="relative" value="vouchers">
              <Input
                type="search"
                placeholder="Search..."
                className="mb-4 flex grow"
                value={search}
                onChange={(v) => setSearch(v.target.value)}
              />
              <VoucherList vouchers={filteredVouchers || []} />
            </TabsContent>
            <TabsContent className="" value="pools">
              <PoolList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
};

export default WalletPage;
