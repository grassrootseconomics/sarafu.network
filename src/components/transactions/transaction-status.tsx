import { CircleCheck, CircleX, ExternalLink, Share2 } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import useWebShare from "~/hooks/use-web-share";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { Loading } from "../loading";
import Hash from "../transactions/hash";
import { Button } from "../ui/button";

export function TransactionStatus({ hash }: { hash?: `0x${string}` }) {
  const { data, isError, isLoading, error } = useWaitForTransactionReceipt({
    hash: hash!,
    ...defaultReceiptOptions,
    query: {
      enabled: Boolean(hash),
    },
  });
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const share = useWebShare();

  useEffect(() => {
    if (!data) return;
    utils.me.events.refetch().catch(console.error);
    void queryClient.invalidateQueries({ queryKey: ["readContract"] });
    void queryClient.invalidateQueries({ queryKey: ["readContracts"] });
  }, [data, utils, queryClient]);

  // Waiting for Hash State
  if (!hash) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
          <Loading />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Preparing Transaction
          </h2>
          <p className="text-sm text-gray-600">
            Please confirm the transaction in your wallet and wait for it to be
            submitted
          </p>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <Loading />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Processing Transaction
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while your transaction is being confirmed on the
            blockchain
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <Hash hash={hash} />
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <CircleX className="w-12 h-12 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-red-900">
            Transaction Failed
          </h2>
          <div className="space-y-1">
            {error?.name && (
              <p className="text-sm font-medium text-red-700">{error.name}</p>
            )}
            <p className="text-sm text-red-600 max-w-sm mx-auto leading-relaxed">
              {error?.message ||
                "An error occurred while processing your transaction"}
            </p>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <Hash hash={hash} />
        </div>
      </div>
    );
  }

  // Not Found State
  if (!data) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <div className="text-3xl">🤔</div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction Not Found
          </h2>
          <p className="text-sm text-gray-600">
            We couldn&apos;t find this transaction on the blockchain
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <Hash hash={hash} />
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="space-y-6 p-6 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CircleCheck className="w-12 h-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-700">
          Transaction Successful!
        </h2>
        <p className="text-gray-600">
          Your voucher request has been completed successfully
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <Hash hash={hash} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => window.open(celoscanUrl.tx(hash), "_blank")}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View on Celo Explorer
        </Button>

        {share.isSupported && (
          <Button
            variant="outline"
            onClick={() =>
              share.share({
                title: "Transaction Successful",
                text: `Voucher transaction completed successfully`,
                url: celoscanUrl.tx(hash),
              })
            }
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
