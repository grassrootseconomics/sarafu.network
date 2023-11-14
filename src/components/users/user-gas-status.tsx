import { parseUnits } from "viem";
import { useBalance } from "wagmi";
import { api } from "~/utils/api";
import GasRequestDialog from "./dialogs/gas-request-dialog";

const MIN_BALANCE_TO_APPLY = "0.005";

const UserGasStatus = () => {
  const { data: status } = api.me.gasStatus.useQuery();
  const balance = useBalance();
  if (
    status !== "NONE" ||
    !balance.data ||
    balance.data.value >
      parseUnits(MIN_BALANCE_TO_APPLY, balance.data?.decimals)
  )
    return null;
  return (
    <div className=" pl-4 flex align-middle items-center justify-between bg-green-200 rounded-sm">
      Sign-Up for a Social Account
      <GasRequestDialog />
    </div>
  );
};

export default UserGasStatus;
