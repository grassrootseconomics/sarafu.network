"use client";

import { motion } from "framer-motion";
import { QrCodeIcon, SendIcon, WalletIcon } from "lucide-react";
import { useAccount } from "wagmi";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { Balance } from "~/contracts/react";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { ScrollArea } from "../ui/scroll-area";
import { VoucherChip } from "../voucher/voucher-chip";

// Animation variants for tab content
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function WalletHome() {
  const auth = useAuth();

  const { data: vouchers, isLoading: isLoadingVouchers } =
    trpc.me.vouchers.useQuery(undefined, {
      enabled: Boolean(auth?.session?.address),
    });
  const account = useAccount();

  const defaultVoucher = auth?.user?.default_voucher as `0x${string}`;
  const isLoading = isLoadingVouchers || !auth?.session?.address;

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Balance Card */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <WalletIcon className="size-5" />
                <h2 className="text-sm font-medium">Current Balance</h2>
              </div>
              <div className="bg-white rounded-full p-1.5">
                <VoucherChip
                  voucher_address={defaultVoucher}
                  className="text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-baseline mt-2">
              {isLoading ? (
                <Skeleton className="h-10 w-32 bg-white/20" />
              ) : (
                <span className="text-4xl font-bold">
                  <Balance token={defaultVoucher} address={account.address} />
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex w-full justify-evenly gap-4">
        <SendDialog
          button={
            <Button className=" text-black flex font-medium flex-col items-center justify-between bg-primary/20 hover:bg-primary/60 h-18 w-28 p-2">
              <SendIcon className="text-primary size-6 my-1" />
              Send
            </Button>
          }
        />
        <ReceiveDialog
          voucherAddress={defaultVoucher}
          button={
            <Button className=" text-black flex font-medium flex-col items-center justify-between bg-primary/20 hover:bg-primary/60 h-18 w-28 p-2">
              <QrCodeIcon className="text-primary size-6 my-1" />
              Receive
            </Button>
          }
        />
      </div>

      {/* Tabs Section */}
      <div className="relative">
        <Tabs defaultValue="balances" className="w-full">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsList className="w-full grid grid-cols-2 rounded-lg bg-muted/50 p-1">
              <TabsTrigger
                value="balances"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                Balances
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="balances" asChild>
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className="m-0 p-0"
              >
                {isLoadingVouchers ? (
                  <div className="space-y-3 px-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg animate-pulse"
                      >
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                ) : vouchers && vouchers.length > 0 ? (
                  <ScrollArea className="h-[calc(60vh-4rem)] overflow-y-auto pr-2 rounded-lg">
                    <div className="space-y-2">
                      <UserVoucherBalanceList vouchers={vouchers} />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <p>No vouchers found in your wallet</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="history" asChild>
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className="m-0 p-0"
              >
                <ScrollArea className="h-[calc(60vh-4rem)] overflow-y-auto pr-2 rounded-lg">
                  <div className="space-y-2">
                    <TransactionList />
                  </div>
                </ScrollArea>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
