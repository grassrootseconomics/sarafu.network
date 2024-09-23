import { getIronSession } from "iron-session";
import { QrCodeIcon, SendIcon } from "lucide-react";
import { type GetServerSideProps } from "next";
import { useAccount } from "wagmi";
import Balance from "~/components/balance";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { ContentContainer } from "~/components/layout/content-container";
import { useVoucherDetails } from "~/components/pools/hooks";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UserGasStatus from "~/components/users/user-gas-status";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { useAuth } from "~/hooks/useAuth";
import { sessionOptions, type SessionData } from "~/lib/session";
import { api } from "~/utils/api";
export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
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

  const { data } = api.transaction.list.useQuery(
    {
      accountAddress: auth?.user?.account.blockchain_address,
      limit: 40,
    },
    {
      enabled: Boolean(auth?.user?.account.blockchain_address),
    }
  );
  const { data: vouchers } = api.me.vouchers.useQuery();
  const { data: me } = api.me.get.useQuery();
  const account = useAccount();
  const { data: voucherDetails } = useVoucherDetails(
    me?.default_voucher as `0x${string}`
  );
  const txs = data?.transactions;
  return (
    <ContentContainer title="Wallet">
      <div className="max-w-lg w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <UserGasStatus />
        <div className="bg-primary/80 text-white rounded-lg p-2 h-18 flex flex-col justify-between">
          <div className="w-fit text-xs justify-between bg-white/20 rounded-full p-2">
            <span>{voucherDetails?.symbol ?? "Unknown"}</span>
          </div>
          <div className="flex w-fit justify-between text-3xl py-2 font-bold ml-8">
            <span>
              <Balance
                tokenAddress={me?.default_voucher as string}
                address={account.address}
              />
            </span>
          </div>
        </div>
        <div className="flex w-full justify-evenly py-8 gap-4">
          <SendDialog
            button={
              <Button className=" text-black flex font-medium flex-col items-center justify-between bg-primary/20 hover:bg-primary/60 h-18 w-28 p-2">
                <SendIcon className="text-primary size-6 my-1" />
                Send
              </Button>
            }
          />
          <ReceiveDialog
            button={
              <Button className=" text-black flex font-medium flex-col items-center justify-between bg-primary/20 hover:bg-primary/60 h-18 w-28 p-2">
                <QrCodeIcon className="text-primary size-6 my-1" />
                Receive
              </Button>
            }
          />
        </div>
        <Tabs
          defaultValue="balances"
          className="h-full flex-grow sticky top-0 "
        >
          <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>
          <TabsContent className="shadow-none" value="history">
            <TransactionList txs={txs ?? []} />
          </TabsContent>
          <TabsContent
            className="shadow-none rounded-lg  gap-2 flex flex-col"
            value="balances"
          >
            <UserVoucherBalanceList vouchers={vouchers ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </ContentContainer>
  );
};

export default WalletPage;
