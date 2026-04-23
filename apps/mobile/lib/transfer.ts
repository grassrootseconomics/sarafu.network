import { useState } from "react";
import {
  createWalletClient,
  erc20Abi,
  http,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import * as SecureStore from "expo-secure-store";

const GAS_SETTINGS = {
  gas: 350_000n,
  maxFeePerGas: 27_000_000_000n, // 27 gwei
  maxPriorityFeePerGas: 5_000_000_000n, // 5 gwei
} as const;

export function useTransferToken() {
  const [isPending, setIsPending] = useState(false);

  async function transfer(
    to: Address,
    tokenAddress: Address,
    amount: bigint
  ): Promise<Hex> {
    setIsPending(true);
    try {
      const privateKey = await SecureStore.getItemAsync("sarafu_private_key");
      if (!privateKey) throw new Error("No wallet key found");

      const account = privateKeyToAccount(privateKey as Hex);
      const walletClient = createWalletClient({
        account,
        chain: celo,
        transport: http("https://r4-celo.grassecon.org"),
      });

      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, amount],
        ...GAS_SETTINGS,
      });

      return hash;
    } finally {
      setIsPending(false);
    }
  }

  return { transfer, isPending };
}
