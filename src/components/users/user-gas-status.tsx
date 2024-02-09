import { useUser } from "~/hooks/useAuth";
import { api } from "~/utils/api";
import GasRequestDialog from "./dialogs/gas-request-dialog";

const UserGasStatus = () => {
  const user = useUser();
  const { data: status } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!user,
  });
  if (status === "APPROVED" || status === "REJECTED") return null;
  if (status === "REQUESTED")
    return (
      <div className="pl-4 pr-6 py-2 font-semibold text-sm flex items-center justify-between text-white bg-warning  rounded-lg shadow-md">
        Your request for a Social Account is pending
      </div>
    );
  return (
    <div className="pl-4 pr-6 py-2 font-semibold text-sm flex items-center justify-between bg-zinc-100  rounded-lg shadow-md">
      <span>Sign-Up for a Social Account</span>
      <GasRequestDialog />
    </div>
  );
};

export default UserGasStatus;
