"use client";
import { useAuth } from "~/hooks/useAuth";

import GasRequestDialog from "./dialogs/gas-request-dialog";

const UserGasStatus = () => {
  const auth = useAuth();
  if (
    auth?.gasStatus === "APPROVED" ||
    auth?.gasStatus === "REJECTED" ||
    auth?.gasStatus === undefined
  )
    return null;
  if (auth?.gasStatus === "REQUESTED")
    return (
      <div className="pl-4 pr-6 py-2 font-light text-sm flex items-center justify-between">
        Your request for a Social Account is pending
        <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
      </div>
    );
  return (
    <div className="pl-4 pr-6 py-2 font-thin text-sm flex items-center justify-between">
      <span>Sign-Up for a Social Account</span>
      <GasRequestDialog />
    </div>
  );
};

export default UserGasStatus;
