import { publicClient } from "~/lib/web3";
import { abi } from "./erc20-demurrage-token/contract";

export const getIsOwner = async (
  address: `0x${string}`,
  voucherAddress: `0x${string}`
) => {
  const owner = await publicClient.readContract({
    address: voucherAddress,
    abi: abi,
    functionName: "owner",
  });
  return owner === address;
};
