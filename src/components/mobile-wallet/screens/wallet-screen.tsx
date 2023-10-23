import { QrCodeIcon, SendIcon } from "lucide-react";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUser } from "~/hooks/useAuth";
import { api } from "~/utils/api";
import { TransactionList } from "../transaction-list";
import { VoucherList } from "../voucher-list";

export const WalletScreen = () => {
  const user = useUser();
  const { data } = api.transaction.list.useQuery(
    {
      accountAddress: user?.account.blockchain_address,
      limit: 40,
    },
    {
      enabled: Boolean(user?.account.blockchain_address),
    }
  );
  const { data: vouchers } = api.user.vouchers.useQuery();

  const txs = data?.transactions;
  return (
    <div>
      <div className="text-3xl font-semibold py-8 text-center">
        Welcome Back 🎉
      </div>

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
      <div>
        <Tabs defaultValue="history" className="mx-2">
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
    </div>
  );
};
