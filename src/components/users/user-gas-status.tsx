import { useUser } from "~/hooks/useAuth";
import { api } from "~/utils/api";
import GasRequestDialog from "./dialogs/gas-request-dialog";

const UserGasStatus = () => {
  const user = useUser();
  const { data: status } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!user,
  });
  if (status === "APPROVED") return null;
  if (status === "REQUESTED")
    return (
      <div className="pl-4 font-light text-sm flex align-middle items-center justify-between bg-secondary/50 text-secondary-foreground-foreground rounded-sm py-2">
        Your request for a Social Account is pending
      </div>
    );
  return (
    <div className=" pl-4 font-light text-sm flex align-middle items-center justify-between bg-secondary/50 text-secondary-foreground-foreground rounded-sm">
      Sign-Up for a Social Account
      <GasRequestDialog />
    </div>
  );
};

export default UserGasStatus;
