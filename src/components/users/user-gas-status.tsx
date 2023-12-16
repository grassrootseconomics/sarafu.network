import { parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useUser } from "~/hooks/useAuth";
import { api } from "~/utils/api";
import GasRequestDialog from "./dialogs/gas-request-dialog";

const MIN_BALANCE_TO_APPLY = "0.005";

const UserGasStatus = () => {
  const user = useUser();
  const { data: status } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!user,
  });
  const account = useAccount();
  const balance = useBalance({ address: account.address });
  if (
    status !== "NONE" ||
    !balance.data ||
    balance.data.value >
      parseUnits(MIN_BALANCE_TO_APPLY, balance.data?.decimals)
  )
    return null;
  return (
    <div className=" pl-4 font-light text-sm flex align-middle items-center justify-between bg-secondary/50 text-secondary-foreground-foreground rounded-sm">
      Sign-Up for a Social Account
      <GasRequestDialog />
    </div>
  );
};

export default UserGasStatus;
