import { kv } from "@vercel/kv";
import {
  type Address,
  isAddress,
  parseAbi,
  type PublicClient,
  type Transport,
} from "viem";
import { type CeloChain, publicClient } from "~/config/viem.config.server";

export async function getTokenDetails(
  client: PublicClient<Transport, CeloChain>,
  {
    address,
  }: {
    address: Address;
  }
): Promise<TokenDetails> {
  if (!isAddress(address)) throw new Error("Invalid address");

  const cacheKey = `token:${address.toLowerCase()}`;
  const cachedToken = await kv.get<TokenDetails>(cacheKey);
  if (cachedToken) return cachedToken;

  const erc20Abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ]);

  try {
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address,
        abi: erc20Abi,
        functionName: "name",
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ]);

    const tokenDetails: TokenDetails = {
      name,
      symbol,
      decimals: Number(decimals),
    };
    await kv.set(cacheKey, tokenDetails);
    return tokenDetails;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch token details from contract");
  }
}

export interface TokenDetails {
  name: string;
  symbol: string;
  decimals: number;
}
