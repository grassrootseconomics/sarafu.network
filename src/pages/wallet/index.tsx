import { getIronSession } from "iron-session";
import { QrCodeIcon, SendIcon } from "lucide-react";
import { type GetServerSideProps } from "next";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UserGasStatus from "~/components/users/user-gas-status";
import { VoucherList } from "~/components/voucher/voucher-list";
import { useUser } from "~/hooks/useAuth";
import { type SessionData, sessionOptions } from "~/lib/session";
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
  const user = useUser({
    redirectTo: "/",
  });

  const { data } = api.transaction.list.useQuery(
    {
      accountAddress: user?.account.blockchain_address,
      limit: 40,
    },
    {
      enabled: Boolean(user?.account.blockchain_address),
    }
  );
  const { data: vouchers } = api.me.vouchers.useQuery();

  const txs = data?.transactions;
  return (
    <div className="max-w-lg w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
      <div className="text-3xl font-semibold py-8 text-center">
        Welcome Back
      </div>
      <UserGasStatus />
      <div className="flex justify-evenly py-8">
        <SendDialog
          button={
            <Button>
              <SendIcon className="mr-2" />
              Send
            </Button>
          }
        />
        <ReceiveDialog
          button={
            <Button>
              <QrCodeIcon className="mr-2" />
              Receive
            </Button>
          }
        />
      </div>
      <Tabs defaultValue="balances" className="h-full flex-grow">
        <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        <TabsContent className="shadow-md" value="history">
          <TransactionList txs={txs ?? []} />
        </TabsContent>
        <TabsContent className="shadow-md" value="balances">
          <VoucherList vouchers={vouchers ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
