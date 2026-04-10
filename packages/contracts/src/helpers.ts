import { type PublicClient, type Transport } from "viem";
import { type CeloChain } from "./chain";
import { abi as dmr20Abi } from "./abi/erc20-demurrage-token/contract";

export const getIsContractOwner = async (
  client: PublicClient<Transport, CeloChain>,
  address: `0x${string}`,
  voucherAddress: `0x${string}`
) => {
  try {
    const owner = await client.readContract({
      address: voucherAddress,
      abi: dmr20Abi,
      functionName: "owner",
    });
    return owner === address;
  } catch {
    return false;
  }
};
