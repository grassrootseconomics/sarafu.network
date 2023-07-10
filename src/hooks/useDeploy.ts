import { useCallback, useState } from "react";
import {
  getAddress,
  isAddress,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abi, bytecode } from "~/contracts/erc20-demurrage-token/contract";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { api } from "~/utils/api";
import { calculateDecayLevel } from "../utils/dmr-helpers";

export type ConstructorArgs = [
  name: string,
  symbol: string,
  decimals: number,
  decay_level: bigint,
  periodMins: bigint,
  sink_address: `0x${string}`
];

export const useDeploy = (
  options: {
    onComplete?: (receipt: TransactionReceipt) => void;
  } = {}
) => {
  const [voucher, setVoucher] =
    useState<Awaited<ReturnType<typeof mutation.mutateAsync>>>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [info, setInfo] = useState<string>();
  const mutation = api.voucher.deploy.useMutation();

  const [hash, setHash] = useState<Hash>();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const deploy = useCallback(
    async (input: Omit<DeployVoucherInput, "voucherAddress">) => {
      if (!walletClient) {
        setError(new Error("No wallet client"));
        return;
      }

      setLoading(true);
      setInfo("Deploying contract");
      const decay_level = calculateDecayLevel(
        input.demurrageRate,
        BigInt(input.periodMinutes)
      );
      const args: ConstructorArgs = [
        input.voucherName,
        input.symbol,
        input.decimals,
        decay_level,
        BigInt(input.periodMinutes),
        input.sinkAddress,
      ];
      const hash = await walletClient.deployContract({
        abi,
        args,
        bytecode: bytecode,
      });
      setHash(hash);

      setInfo("Waiting for Transaction Receipt");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
      if (!receipt.contractAddress || !isAddress(receipt.contractAddress)) {
        setLoading(false);
        setError(Error("No contract address"));
        return;
      }
      const checksummedAddress = getAddress(receipt.contractAddress);
      setReceipt(receipt);
      setInfo("Writing to Token Index and CIC Graph");
      const v = await mutation.mutateAsync({
        ...input,
        voucherAddress: checksummedAddress,
      });
      setVoucher(v);
      setInfo("Done");
      setLoading(false);
    },
    [options, publicClient, walletClient]
  );
  return { deploy, info, receipt, voucher, error, loading, hash };
};
