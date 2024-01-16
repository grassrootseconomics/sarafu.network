import { PlusIcon } from "@radix-ui/react-icons";
import { ArchiveIcon, SendIcon, WalletIcon } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { useIsWriter } from "~/hooks/useIsWriter";
import { cn } from "~/lib/utils";
import MintToDialog from "../dialogs/mint-to-dialog";
import { SendDialog } from "../dialogs/send-dialog";

import { type GetTokenReturnType } from "@wagmi/core";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useIsOwner } from "~/hooks/useIsOwner";
import ChangeSinkAddressDialog from "../dialogs/change-sink-dialog";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface VoucherContractFunctionsProps {
  className?: string;
  voucher: {
    id: number;
    voucher_address: string;
  };
  token?: GetTokenReturnType;
}
export function VoucherContractFunctions({
  className,
  voucher,
  token,
}: VoucherContractFunctionsProps) {
  const toast = useToast();
  const account = useAccount();
  const mounted = useIsMounted();
  const isWriter = useIsWriter(voucher.voucher_address);
  const isOwner = useIsOwner(voucher.voucher_address);
  const wallet = useWalletClient();

  function watchVoucher() {
    if (token?.symbol && token?.decimals) {
      wallet.data
        ?.watchAsset({
          type: "ERC20",
          options: {
            address: voucher.voucher_address,
            symbol: token?.symbol,
            decimals: token?.decimals,
            image: "https://sarafu.network/android-chrome-512x512.png",
          },
        })
        .then((done) => {
          if (done) {
            toast.toast({
              title: "Voucher Added",
              description: `You are now watching ${token?.symbol}`,
              variant: "default",
            });
          } else {
            toast.toast({
              title: "Voucher Watch Failed",
              description: `You are already watching ${token?.symbol}`,
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            toast.toast({
              title: "Failed to Watch Voucher",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast.toast({
              title: "Failed to Watch Voucher",
              description: "Unknown Error",
              variant: "destructive",
            });
          }
        });
    }
  }
  if (!mounted) {
    return null;
  }
  return (
    <div className={cn(className, "flex m-1 space-x-2")}>
      <SendDialog
        voucherAddress={voucher.voucher_address as `0x${string}`}
        button={
          <Button className="mb-2 w-25 " variant={"outline"}>
            <SendIcon className="mr-2 stroke-slate-700 h-3" />
            Send
          </Button>
        }
      />
      {(isWriter || isOwner) && (
        <MintToDialog
          voucher={voucher}
          button={
            <Button className="mb-2 w-25" variant={"outline"}>
              <PlusIcon className="mr-2 stroke-slate-700 h-3" />
              Mint
            </Button>
          }
        />
      )}
      {(isWriter || isOwner) && (
        <ChangeSinkAddressDialog
          voucher={voucher}
          button={
            <Button className="mb-2 w-25" variant={"outline"}>
              <ArchiveIcon className="mr-2 stroke-slate-700 h-3" />
              Change Fund
            </Button>
          }
        />
      )}
      {account?.connector?.id === "metaMask" && (
        <Button
          className="mb-2 w-25"
          variant={"outline"}
          onClick={watchVoucher}
        >
          <WalletIcon className="mr-2 h-4 stroke-slate-700" /> Add to Wallet
        </Button>
      )}
    </div>
  );

}
