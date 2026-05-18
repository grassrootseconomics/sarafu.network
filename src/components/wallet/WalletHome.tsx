"use client";

import { PlusIcon, QrCodeIcon, SendIcon, WalletIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { BuyDialog } from "~/components/dialogs/buy-dialog";
import { ReceiveDialog } from "~/components/dialogs/receive-dialog";
import { SendDialog } from "~/components/dialogs/send-dialog";
import { VerifyPhoneDialog } from "~/components/dialogs/verify-phone-dialog";
import { VoucherSelectorDialog } from "~/components/dialogs/voucher-selector-dialog";
import { TransactionList } from "~/components/transactions/transaction-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { TooltipHelp } from "~/components/ui/tooltip-help";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { useGeoCountry } from "~/context/geo";
import { Balance } from "~/contracts/react";
import { useAuth } from "~/hooks/use-auth";
import { trpc } from "~/lib/trpc";
import { getPhoneCountry } from "~/utils/phone-number";
import {
  ProfileEditTab,
  ProfileStats,
  ProfileTabs,
  UserPoolList,
  UserReportsList,
  UserVoucherGrid,
} from "../profile";
import { VoucherChip } from "../voucher/voucher-chip";

export default function WalletHome() {
  const auth = useAuth();

  const { data: vouchers, isLoading: isLoadingVouchers } =
    trpc.me.vouchers.useQuery(undefined, {
      enabled: Boolean(auth?.session?.address),
    });
  const account = useAccount();
  const address = auth?.session?.address as `0x${string}`;
  const defaultVoucher = auth?.user?.default_voucher as `0x${string}`;
  const isLoading = isLoadingVouchers || !auth?.session?.address;

  const geoCountry = useGeoCountry();
  const phoneCountry = auth?.user?.phone_number
    ? getPhoneCountry(auth.user.phone_number)
    : undefined;
  const isKenya =
    geoCountry?.toUpperCase() === "KE" || phoneCountry === "KE";
  const isVerifiedKenyan = Boolean(
    auth?.user?.phone_verified_at && phoneCountry === "KE"
  );
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 mt-6 pb-8">
      {/* Hero Section - Balance Card with improved visual hierarchy */}
      <Card className="max-w-2xl mx-auto w-full border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white p-8 rounded-xl">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-xs rounded-full p-2">
                  <WalletIcon className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-medium text-white/80">
                      Available Balance
                    </h2>
                    <TooltipHelp
                      content="The amount you can currently spend in your primary voucher. You can hold multiple vouchers, but this shows your main one."
                      iconClassName="text-white/50 hover:text-white/80"
                    />
                  </div>
                  {vouchers?.length ? (
                    <p className="text-xs text-white/60">
                      Primary Voucher • Tap to switch
                    </p>
                  ) : null}
                </div>
              </div>
              {vouchers?.length ? (
                <VoucherSelectorDialog
                  currentVoucher={defaultVoucher}
                  button={
                    <button
                      className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-md hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary cursor-pointer"
                      aria-label="Switch primary voucher"
                      title="Click to change your primary voucher"
                    >
                      <VoucherChip
                        voucher_address={defaultVoucher}
                        className="text-gray-900 font-medium pointer-events-none"
                      />
                    </button>
                  }
                />
              ) : null}
            </div>

            {/* Balance Display */}
            <div className="flex items-baseline gap-3 mb-6">
              {isLoading ? (
                <Skeleton className="h-14 w-48 bg-white/20 rounded-lg" />
              ) : (
                <span className="text-5xl md:text-6xl font-bold tracking-tight">
                  <Balance token={defaultVoucher} address={account.address} />
                </span>
              )}
            </div>

            {/* Add Funds pill button (Kenya-only: KES → stablecoin via M-PESA).
                If the user's phone isn't verified yet, route through OTP first. */}
            {isKenya ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary cursor-pointer"
                aria-label="Add funds with KES via M-PESA"
                onClick={() =>
                  isVerifiedKenyan ? setBuyOpen(true) : setVerifyOpen(true)
                }
              >
                <span>Add Funds</span>
                <PlusIcon className="size-4" />
              </button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Enhanced with better spacing and sizing */}
      <div className="flex max-w-2xl mx-auto w-full justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
          <SendDialog
            button={
              <Button
                className="w-full text-black flex font-semibold flex-col items-center justify-center bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all duration-200 h-24 rounded-2xl border-2 border-primary/20 hover:border-primary/40 shadow-xs hover:shadow-md"
                aria-label="Send vouchers to another wallet"
              >
                <SendIcon className="text-primary size-8 mb-2" />
                <span className="text-base">Send</span>
              </Button>
            }
          />
          <p className="text-xs text-center text-muted-foreground leading-tight">
            Transfer vouchers to another wallet
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
          <ReceiveDialog
            voucherAddress={defaultVoucher}
            button={
              <Button
                className="w-full text-black flex font-semibold flex-col items-center justify-center bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all duration-200 h-24 rounded-2xl border-2 border-primary/20 hover:border-primary/40 shadow-xs hover:shadow-md"
                aria-label="Receive vouchers via QR code or NFC"
              >
                <QrCodeIcon className="text-primary size-8 mb-2" />
                <span className="text-base">Receive</span>
              </Button>
            }
          />
          <p className="text-xs text-center text-muted-foreground leading-tight">
            Request payment or generate QR code
          </p>
        </div>
      </div>

      {/* Controlled dialogs for the Add Funds CTA */}
      <VerifyPhoneDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onVerified={() => {
          setVerifyOpen(false);
          setBuyOpen(true);
        }}
      />
      <BuyDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        onReverify={() => {
          setBuyOpen(false);
          setVerifyOpen(true);
        }}
      />

      {/* Main Content - Consolidated Tabs */}
      <div className="max-w-6xl mx-auto w-full">
        <ProfileTabs
          statsContent={<ProfileStats address={address} />}
          balancesContent={<UserVoucherBalanceList vouchers={vouchers ?? []} isOwnProfile />}
          transactionsContent={<TransactionList />}
          vouchersContent={<UserVoucherGrid address={address} isOwnProfile />}
          poolsContent={<UserPoolList address={address} isOwnProfile />}
          reportsContent={<UserReportsList address={address} isOwnProfile />}
          settingsContent={<ProfileEditTab />}
          defaultTab="balances"
          isOwnProfile
        />
      </div>
    </div>
  );
}
