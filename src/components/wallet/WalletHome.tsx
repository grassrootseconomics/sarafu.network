"use client";

import { QrCodeIcon, SendIcon } from "lucide-react";
import { useAccount } from "wagmi";
import Balance from "~/components/balance";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { useVoucherDetails } from "~/components/pools/hooks";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";

export default function WalletHome() {
  const auth = useAuth();
  const { data } = trpc.transaction.events.useQuery(
    {
      accountAddress: auth?.session?.address as `0x${string}`,
      limit: 20,
    },
    {
      enabled: Boolean(auth?.session?.address),
    }
  );
  const { data: vouchers } = trpc.me.vouchers.useQuery(undefined, {
    enabled: Boolean(auth?.session?.address),
  });
  const account = useAccount();
  const { data: voucherDetails } = useVoucherDetails(
    auth?.user?.default_voucher as `0x${string}`
  );
  const events = data?.events;

  return (
    <>
      <div className="bg-primary/80 text-white rounded-lg p-2 h-18 flex flex-col justify-between">
        <div className="w-fit text-xs justify-between bg-white/20 rounded-full p-2">
          <span>{voucherDetails?.symbol ?? "Unknown"}</span>
        </div>
        <div className="flex w-fit justify-between text-3xl py-2 font-bold ml-8">
          <span>
            <Balance
              tokenAddress={auth?.user?.default_voucher as string}
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
      <Tabs defaultValue="balances" className="h-full flex-grow sticky top-0 ">
        <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        <TabsContent className="shadow-none" value="history">
          <TransactionList events={events ?? []} />
        </TabsContent>
        <TabsContent
          className="shadow-none rounded-lg  gap-2 flex flex-col"
          value="balances"
        >
          <UserVoucherBalanceList vouchers={vouchers ?? []} />
        </TabsContent>
      </Tabs>
    </>
  );
}
