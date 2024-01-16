import { GasGiftStatus } from "~/server/enums";
import { api } from "~/utils/api";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
const StaffGasApproval = ({ address }: { address: `0x${string}` }) => {
  const { data: status, isLoading } = api.gas.get.useQuery({
    address,
  });
  const utils = api.useUtils();
  const approve = api.gas.approve.useMutation({
    onSuccess: () => {
      void utils.gas.get.invalidate({ address });
      void utils.user.list.invalidate();
    },
  });
  const reject = api.gas.reject.useMutation({
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
      <div className="flex space-x-2 h-7 align-middle items-center">
        <Button
          onClick={() => approve.mutate({ address })}
          disabled={
            isLoading || approve.isPending || status === GasGiftStatus.APPROVED
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
    </div>
  );
};
export const gasBadgeVariant = {
  APPROVED: "default",
  REQUESTED: "warning",
  REJECTED: "destructive",
  NONE: "success",
} as const;
export default StaffGasApproval;
