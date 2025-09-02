"use client";

import { ChevronLeft, CreditCard, SproutIcon, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ResponsiveModal } from "~/components/modal";
import { useAuth } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { Button } from "../../ui/button";
import { type SwapPool } from "../types";
import { DonationSuccessModal } from "./donation-success-modal";
import { NormieDonationForm } from "./normie-donation-form";
import { SendForm } from "~/components/dialogs/send-dialog";

interface DonateToPoolProps {
  pool: SwapPool;
  button?: React.ReactNode;
}
export const DonateToPoolButton = (props: DonateToPoolProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"square" | "web3">();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const auth = useAuth();
  const hasVouchers = Number(props.pool.tokenIndex.entryCount) > 0;
  const searchParams = useSearchParams();

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (transactionId && orderId) {
      setShowSuccessModal(true);
    }
  }, [searchParams]);

  return (
    <>
      <ResponsiveModal
        button={
          <Button
            variant={"outline"}
            className="hover:bg-primary hover:text-white transition-colors"
            disabled={!hasVouchers}
          >
            <SproutIcon className="size-5 mr-2" />
            Support this Pool
          </Button>
        }
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setType(undefined);
        }}
        title={
          type
            ? `Support ${type === "web3" ? "Tokens" : "with Card"}`
            : "Support this Pool"
        }
        description={
          !type
            ? "Choose your preferred method"
            : type === "web3"
            ? "Support this pool with tokens directly from your wallet"
            : "Make a secure card payment to support this pool"
        }
      >
        {!type ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="group p-8 h-auto flex flex-col gap-4 hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setType("square")}
              >
                <CreditCard className="h-12 w-12 group-hover:text-primary transition-colors" />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Credit Card
                  </h3>
                  <p className="text-sm text-muted-foreground text-wrap">
                    Quick and easy
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "group p-8 h-auto flex flex-col gap-4 hover:border-primary hover:bg-primary/5 transition-colors",
                  !auth?.session && "opacity-50"
                )}
                onClick={() => setType("web3")}
                disabled={!auth?.session}
              >
                <Wallet className="h-12 w-12 group-hover:text-primary transition-colors" />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Web3 Wallet
                  </h3>
                  <p className="text-sm text-muted-foreground text-wrap">
                    {auth?.session
                      ? "Support this pool with tokens directly from your wallet"
                      : "Connect wallet to enable"}
                  </p>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground hover:text-foreground"
              onClick={() => setType(undefined)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to options
            </Button>

            {type === "square" ? (
              <NormieDonationForm
                pool={props.pool}
                onSuccess={() => setOpen(false)}
              />
            ) : (
              <DonateToPoolForm
                onSuccess={() => setOpen(false)}
                pool={props.pool}
              />
            )}
          </div>
        )}
      </ResponsiveModal>

      <DonationSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />
    </>
  );
};

/**
 * Donate to pool form using SendForm with pool address as recipient
 */
const DonateToPoolForm = ({
  pool,
  onSuccess,
}: {
  pool: SwapPool;
  onSuccess: () => void;
}) => {
  return (
    <SendForm
      recipientAddress={pool.address}
      onSuccess={onSuccess}
      className="space-y-6"
    />
  );
};
