"use client";
import { useAuth } from "~/hooks/useAuth";

import { X } from "lucide-react";
import { useBalance } from "wagmi";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import GasRequestDialog from "./dialogs/gas-request-dialog";

const UserGasStatus = ({ className }: { className?: string }) => {
  const auth = useAuth();
  const [dismissed, setDismissed] = useLocalStorage(
    `${auth?.account.address}-gas-status-dismissed`,
    false
  );
  const balance = useBalance({
    address: auth?.account.address,
    query: {
      enabled: !!auth?.account.address,
    },
  });
  const hasBalance = balance.data?.value && balance.data.value > BigInt(0);
  const isApproved = auth?.gasStatus === "APPROVED";
  const isRejected = auth?.gasStatus === "REJECTED";
  const isUndefined = auth?.gasStatus === undefined;
  if (isApproved || isRejected || isUndefined || hasBalance || dismissed)
    return null;

  if (auth?.gasStatus === "REQUESTED")
    return (
      <div className="pl-4 pr-6 py-2 font-light text-sm flex items-center justify-between">
        Your request for a Social Account is pending
        <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
      </div>
    );
  return (
    <div
      className={cn(
        "pl-4 pr-1 py-2 font-base text-sm flex items-center justify-between bg-orange-500/80 text-primary-foreground my-2 flex-wrap gap-2 rounded-xl m-1",
        className
      )}
    >
      <span>
        Your CELO balance is empty. Apply for a social account to start using
        the platform.
      </span>
      <div className="flex gap-4 justify-between w-full lg:w-auto">
        <GasRequestDialog
          button={
            <Button className="bg-white text text-black" variant="outline">
              Apply Now
            </Button>
          }
        />
        <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
          <X />
        </Button>
      </div>
    </div>
  );
};

export default UserGasStatus;
