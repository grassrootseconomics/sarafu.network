import { ArchiveIcon, PlusIcon, SendIcon, WalletIcon } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { useIsWriter } from "~/hooks/useIsWriter";
import { cn } from "~/lib/utils";
import { SendDialog } from "../dialogs/send-dialog";

import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { type RouterOutputs } from "~/lib/trpc";
import ChangeSinkAddressDialog from "../dialogs/change-sink-dialog";
import MintToDialog from "../dialogs/mint-to-dialog";
import { useVoucherDetails } from "../pools/hooks";
import { Button } from "../ui/button";

interface ManageVoucherFunctionsProps {
  className?: string;
  voucher_address: string;
}
interface BasicVoucherFunctionsProps {
  className?: string;
  voucher_address: string;
  voucher?: RouterOutputs["voucher"]["byAddress"];
}
export function ManageVoucherFunctions({
  className,
  voucher_address,
}: ManageVoucherFunctionsProps) {
  const mounted = useIsMounted();
  const isWriter = useIsWriter(voucher_address);
  const isOwner = useIsContractOwner(voucher_address);
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
        <ChangeSinkAddressDialog
          voucher_address={voucher_address as `0x${string}`}
          button={
            <Button className="mb-2 w-25" variant={"outline"}>
              <ArchiveIcon className="mr-2 stroke-slate-700 h-3" />
              Change Fund
            </Button>
          }
        />
      )}
    </div>
  );
}

export function BasicVoucherFunctions({
  className,
  voucher_address,
  voucher,
}: BasicVoucherFunctionsProps) {
  const account = useAccount();
  const mounted = useIsMounted();
  const wallet = useWalletClient();
  const isWriter = useIsWriter(voucher_address);
  const isOwner = useIsContractOwner(voucher_address);
  const { data: details } = useVoucherDetails(voucher_address as `0x${string}`);
  function watchVoucher() {
    if (details?.symbol && details?.decimals) {
      wallet.data
        ?.watchAsset({
          type: "ERC20",
          options: {
            address: voucher_address,
            symbol: details.symbol,
            decimals: details.decimals,
            image:
              voucher?.icon_url ||
              "https://sarafu.network/android-chrome-512x512.png",
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
          voucher_address={voucher_address as `0x${string}`}
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
          voucher_address={voucher_address as `0x${string}`}
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
