// Client Components
"use client";

import { PiggyBank } from "lucide-react";
import { ConnectButton } from "~/components/buttons/connect-button";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { PoolFeesDialog } from "~/components/pools/forms/fees-form";
import { SwapDialog } from "~/components/pools/forms/swap-form";
import { WithdrawDialog } from "~/components/pools/forms/withdraw-form";
import { type SwapPool } from "~/components/pools/types";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { useIsContractOwner } from "~/hooks/useIsOwner";

export function PoolButtons({ pool }: { pool: SwapPool }) {
  const auth = useAuth();
  const isOwner = useIsContractOwner(pool.address);

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {auth?.account ? (
        <>
          <SwapDialog pool={pool} />
          {pool && <DonateToPoolButton pool={pool} />}
          {isOwner && pool && <PoolFeesDialog pool={pool} />}
          {isOwner && pool && (
            <WithdrawDialog
              pool={pool}
              button={
                <Button variant="outline">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  Withdraw Fees
                </Button>
              }
            />
          )}
        </>
      ) : (
        <>
          <ConnectButton />
          {pool && <DonateToPoolButton pool={pool} />}
        </>
      )}
    </div>
  );
}
