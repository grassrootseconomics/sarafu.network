import type { Session } from "@grassroots/auth";
import { type GetServerSideProps } from "next";
import { sessionOptions } from "@grassroots/auth";
import { getIronSession } from "iron-session";
import { QrCodeIcon, SendIcon } from "lucide-react";

import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { ContentContainer } from "~/components/layout/content-container";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UserGasStatus from "~/components/users/user-gas-status";
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

  const { data } = api.transaction.list.useQuery(
    {
      accountAddress: auth?.user?.account.blockchain_address,
      limit: 40,
    },
    {
      enabled: Boolean(auth?.user?.account.blockchain_address),
    },
  );
  const { data: vouchers } = api.me.vouchers.useQuery();

  const txs = data?.transactions;
  return (
    <ContentContainer title="Wallet">
      <div className="mx-auto flex w-full max-w-lg flex-grow flex-col px-1 sm:px-2">
        <UserGasStatus />
        <div className="flex w-full justify-evenly gap-4 py-8">
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
              <Button variant={"outline"}>
                <QrCodeIcon className="mr-2" />
                Receive
              </Button>
            }
          />
        </div>
        <Tabs defaultValue="balances" className="sticky top-0 h-full flex-grow">
          <TabsList className="mx-auto my-2 mb-4 grid w-fit grid-cols-2">
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
    </ContentContainer>
  );
};

export default WalletPage;
