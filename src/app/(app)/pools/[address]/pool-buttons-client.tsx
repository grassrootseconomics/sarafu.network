// Client Components
"use client";

import { RefreshCcw } from "lucide-react";
import { ConnectButton } from "~/components/buttons/connect-button";
import { ResponsiveModal } from "~/components/modal";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { PoolFeesDialog } from "~/components/pools/forms/fees-form";
import { SwapForm } from "~/components/pools/forms/swap-form";
import { WithdrawFromPoolButton } from "~/components/pools/forms/withdraw-form";
import { type SwapPool } from "~/components/pools/types";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

export function PoolButtons({ pool }: { pool: SwapPool }) {
  const auth = useAuth();
  const isOwner = Boolean(
    pool?.owner && pool?.owner === auth?.session?.address
  );

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {auth?.account ? (
        <>
          <ResponsiveModal
            title="Swap"
            button={
              <Button disabled={Number(pool?.tokenIndex.entryCount) === 0}>
                <RefreshCcw className="mr-2 h-5 w-5" />
                Swap
              </Button>
            }
          >
            <SwapForm swapPool={pool} />
          </ResponsiveModal>
          {pool && <DonateToPoolButton pool={pool} />}
          {isOwner && pool && <PoolFeesDialog pool={pool} />}
          {isOwner && pool && (
            <WithdrawFromPoolButton
              pool={pool}
              button={
                <Button variant="outline">
                  <RefreshCcw className="mr-2 h-5 w-5" />
                  Withdraw
                </Button>
              }
            />
          )}
        </>
      ) : (
        <ConnectButton />
      )}
    </div>
  );
}
