import { type vouchers } from "@prisma/client";
import { useCallback, useState } from "react";
import { isAddress, type Hash, type TransactionReceipt } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { api } from "~/utils/api";
import { abi, bytecode } from "../contracts/erc20-demurrage-token/contract";
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
  const [voucher, setVoucher] = useState<vouchers>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [info, setInfo] = useState<string>();

  const [hash, setHash] = useState<Hash>();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const deploy = useCallback(
    async (input: Omit<DeployVoucherInput["voucher"], "voucherAddress">) => {
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
      setReceipt(receipt);
      setInfo("Writing to Token Index and CIC Graph");
      const mutation = api.voucher.deploy.useMutation();
      const v = await mutation.mutateAsync({
        voucher: {
          ...input,
          voucherAddress: receipt.contractAddress,
        },
      });
      setVoucher(v);
      setInfo("Done");
      setLoading(false);
      options.onComplete?.(receipt);
    },
    [options, publicClient, walletClient]
  );
  return { deploy, info, receipt, voucher, error, loading, hash };
};
