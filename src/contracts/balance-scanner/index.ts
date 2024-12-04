import { type Chain, type PublicClient, type Transport } from "viem";
import { env } from "~/env";
import { abi } from "./contract";

export async function getBalances<t extends Transport, c extends Chain>(
  client: PublicClient<t, c>,
  options: {
    address: `0x${string}`;
    tokenAddresses: `0x${string}`[];
  }
) {
  const balances = await client.readContract({
    address: env.NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS,
    abi: abi,
    functionName: "tokensBalance",
    args: [options.address, options.tokenAddresses],
  });
  return balances;
}
