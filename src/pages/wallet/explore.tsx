import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import React from "react";
import { Loading } from "~/components/loading";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherList } from "~/components/voucher/voucher-list";
import { useUser } from "~/hooks/useAuth";
import { sessionOptions } from "~/lib/session";
import { api } from "~/utils/api";
export const getServerSideProps = withIronSessionSsr(({ req, res }) => {
  const user = req.session.user;

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
}, sessionOptions);

const WalletPage = () => {
  const user = useUser({
    redirectOnNull: "/",
  });
  const router = useRouter();
  React.useEffect(() => {
    if (!user) {
      router.push("/").catch(console.error);
    }
  }, [user]);
  const { data: vouchers } = api.voucher.all.useQuery();
  const [search, setSearch] = React.useState("");
  const filteredVouchers = React.useMemo(
    () =>
      vouchers?.filter(
        (voucher) =>
          voucher.voucher_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.location_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.symbol?.toLowerCase().includes(search.toLowerCase())
      ),
    [vouchers, search]
  );
  if (!user) {
    return <Loading />;
  }
  return (
    <div className="max-w-lg w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
      <div className="text-3xl font-semibold pt-4 pb-2 text-center">
        Explore
      </div>
      <div>
        <Tabs defaultValue="vouchers" className="max-h-full">
          <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger disabled value="market">
              Marketplace
            </TabsTrigger>
          </TabsList>
          <TabsContent className="shadow-md" value="vouchers">
            <Input
              type="search"
              placeholder="Search..."
              className="flex grow mb-4"
              value={search}
              onChange={(v) => setSearch(v.target.value)}
            />
            <VoucherList vouchers={filteredVouchers || []} />
          </TabsContent>
          <TabsContent className="shadow-md" value="market"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;
