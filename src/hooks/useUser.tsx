import { useAccount } from "wagmi";
import { env } from "~/env.mjs";

const authorizedAddresses = env.NEXT_PUBLIC_AUTHORIZED_ADDRESSES.split(",");
export const useUser = () => {
  const account = useAccount();
  const isAdmin =
    account?.address &&
    account.isConnected &&
    authorizedAddresses.includes(account.address);
  return {
    account,
    isAdmin,
  };
};
