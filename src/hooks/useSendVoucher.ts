import { useState } from "react";
import {
  parseAbi,
  parseUnits,
  type Account,
  type TransactionReceipt,
  type WalletClient,
} from "viem";
import { usePublicClient } from "wagmi";
import { getViemChain } from "~/lib/web3";

export const useSendVoucher = (client: WalletClient) => {
  const [hash, setHash] = useState<string>();
  const publicClient = usePublicClient();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  // Add any custom logic or additional functions

  const transfer = async (
    voucher: {
      address: string;
      decimals: number;
    },
    recipient: {
      address: `0x${string}`;
    },
    amount: `${number}`
  ) => {
    const value = BigInt(parseUnits(amount, voucher.decimals));
    const args = [recipient.address, value] as const;
    const txHash = await client?.writeContract({
      account: client?.account as Account,
      chain: getViemChain(),
      address: voucher.address as `0x${string}`,
      functionName: "transfer",
      abi: parseAbi([
        "function transfer(address _to, uint256 _value) public returns (bool)",
      ]),
      args: args,
    });

    if (txHash) {
      setHash(txHash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      setReceipt(receipt);
    }
  };

  return {
    transfer,
    hash,
    receipt,
  };
};
