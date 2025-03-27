import { getCeloClient } from "~/lib/web3";
import { abi as dmr20Abi } from "./erc20-demurrage-token/contract";

export const getIsContractOwner = async (
  address: `0x${string}`,
  voucherAddress: `0x${string}`
) => {
  const client = getCeloClient();

  const owner = await client.readContract({
    address: voucherAddress,
    abi: dmr20Abi,
    functionName: "owner",
  });
  return owner === address;
};
