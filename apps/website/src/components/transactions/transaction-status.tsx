import { useEffect } from "react";
import { celoscanUrl } from "@grassroots/shared/utils/celo";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useWaitForTransactionReceipt } from "wagmi";

import useWebShare from "~/hooks/useWebShare";
import { api } from "~/utils/api";
import { Loading } from "../loading";
import Hash from "../transactions/hash";
import { Button } from "../ui/button";

export function TransactionStatus({ hash }: { hash: `0x${string}` }) {
  const { data, isError, isLoading, error } = useWaitForTransactionReceipt({
    hash: hash,
  });
  const utils = api.useUtils();
  const share = useWebShare();

  useEffect(() => {
    utils.transaction.list.refetch().catch(console.error);
  }, [data]);
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center align-middle">
        <Loading status={`Waiting for Transaction`} />
        <div className="mt-2">
          <Hash hash={hash} />
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center align-middle">
        <CrossCircledIcon color="red" width={40} height={40} />
        <div className="text-center text-lg font-semibold">Error</div>
        <div className="text-md">{error?.name}</div>
        <div className="text-sm">{error?.message}</div>
      </div>
    );
  if (!data)
    return <div className="text-center text-lg">Transaction not found 🤔</div>;

  return (
    <div className="flex flex-col items-center justify-center align-middle">
      <CheckCircledIcon color="lightgreen" width={40} height={40} />
      <div className="text-center text-lg font-semibold">Success</div>
      <div className="mt-2 flex items-center justify-center">
        <Hash hash={hash} />
        {share.isSupported && (
          <Button
            variant={"ghost"}
            className="ml-2"
            onClick={() =>
              share.share({
                title: "Voucher Sent",
                text: `Voucher sent to ${data?.to ?? ""}`,
                url: celoscanUrl.tx(hash),
              })
            }
          >
            <Share1Icon />
          </Button>
        )}
      </div>
    </div>
  );
}
