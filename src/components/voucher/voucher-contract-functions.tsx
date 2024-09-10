import { PlusIcon } from "@radix-ui/react-icons";
import { ArchiveIcon, SendIcon, WalletIcon } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { useIsWriter } from "~/hooks/useIsWriter";
import { cn } from "~/lib/utils";
import MintToDialog from "../dialogs/mint-to-dialog";
import { SendDialog } from "../dialogs/send-dialog";

import { type GetTokenReturnType } from "@wagmi/core";
import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useIsOwner } from "~/hooks/useIsOwner";
import ChangeSinkAddressDialog from "../dialogs/change-sink-dialog";
import { Button } from "../ui/button";

interface VoucherContractFunctionsProps {
  className?: string;
  voucher_address: string;
  token?: GetTokenReturnType;
}
export function VoucherContractFunctions({
  className,
  voucher_address,
  token,
}: VoucherContractFunctionsProps) {
  const account = useAccount();
  const mounted = useIsMounted();
  const isWriter = useIsWriter(voucher_address);
  const isOwner = useIsOwner(voucher_address);
  const wallet = useWalletClient();
  function watchVoucher() {
    if (token?.symbol && token?.decimals) {
      wallet.data
        ?.watchAsset({
          type: "ERC20",
          options: {
            address: voucher_address,
            symbol: token?.symbol,
            decimals: token?.decimals,
            image: "https://sarafu.network/android-chrome-512x512.png",
          },
        })
        .then((done) => {
          if (done) {
            toast.success("Voucher Watched");
          } else {
            toast.error("Sorry, something went wrong.");
          }
        })
        .catch((error) => {
          toast.error("Sorry, something went wrong.");
          console.error(error);
        });
    }
  }
  if (!mounted) {
    return null;
  }
  return (
    <div className={cn(className, "flex m-1 gap-2 flex-wrap")}>
      <SendDialog
        voucherAddress={voucher_address as `0x${string}`}
        button={
          <Button className="mb-2 w-25 " variant={"outline"}>
            <SendIcon className="mr-2 stroke-slate-700 h-3" />
            Send
          </Button>
        }
      />
      {(isWriter || isOwner) && (
        <MintToDialog
          voucher_address={voucher_address}
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
          voucher_address={voucher_address}
          button={
            <Button className="mb-2 w-25" variant={"outline"}>
              <ArchiveIcon className="mr-2 stroke-slate-700 h-3" />
              Change Fund
            </Button>
          }
        />
      )}
      {account?.connector?.id &&
        ["io.metamask"].includes(account?.connector?.id) && (
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
