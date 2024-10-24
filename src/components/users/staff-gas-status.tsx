"use client";

import { Authorization } from "~/hooks/useAuth";
import { GasGiftStatus } from "~/server/enums";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { trpc } from "~/lib/trpc";
const StaffGasApproval = ({ address }: { address: `0x${string}` }) => {
  const { data: status, isLoading } = trpc.gas.get.useQuery({
    address,
  });
  const utils = trpc.useUtils();
  const approve = trpc.gas.approve.useMutation({
    onSuccess: () => {
      void utils.gas.get.invalidate({ address });
      void utils.user.list.invalidate();
    },
  });
  const reject = trpc.gas.reject.useMutation({
    onSuccess: () => {
      void utils.gas.get.invalidate({ address });
      void utils.user.list.invalidate();
    },
  });

  return (
    <div className="flex justify-between align-middle items-center">
      <div className="flex space-x-2 h-7 align-middle items-center">
        <label>Status:</label>
        {isLoading ? (
          <Loading />
        ) : (
          <Badge
            variant={gasBadgeVariant[status as keyof typeof GasGiftStatus]}
          >
            {status}
          </Badge>
        )}
      </div>
      <Authorization resource={"Gas"} action="APPROVE">
        <div className="flex space-x-2 h-7 align-middle items-center">
          <Button
            onClick={() => approve.mutate({ address })}
            disabled={
              isLoading ||
              approve.isPending ||
              status === GasGiftStatus.APPROVED
            }
          >
            {approve.isPending ? <Loading /> : "Approve"}
          </Button>
          <Button
            onClick={() => reject.mutate({ address })}
            disabled={
              isLoading || reject.isPending || status === GasGiftStatus.REJECTED
            }
            variant={"destructive"}
          >
            {reject.isPending ? <Loading /> : "Reject"}
          </Button>
        </div>
      </Authorization>
    </div>
  );
};
export const gasBadgeVariant = {
  APPROVED: "default",
  REQUESTED: "warning",
  REJECTED: "destructive",
  NONE: "info",
} as const;
export default StaffGasApproval;
