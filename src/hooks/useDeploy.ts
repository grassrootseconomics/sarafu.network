import { useCallback, useState } from "react";
import { Hash, TransactionReceipt, getAddress, stringify } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { InsertVoucherBody } from "../../pages/api/deploy";
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
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [info, setInfo] = useState<string>();

  const [hash, setHash] = useState<Hash>();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const deploy = useCallback(
    async (voucher: Omit<InsertVoucherBody["voucher"], "voucherAddress">) => {
      if (!walletClient) {
        setError(new Error("No wallet client"));
        return;
      }

      setLoading(true);
      setInfo("Deploying contract");
      const decay_level = calculateDecayLevel(
        voucher.demurrageRate,
        BigInt(voucher.periodMinutes)
      );
      const args: ConstructorArgs = [
        voucher.voucherName,
        voucher.symbol,
        voucher.decimals,
        decay_level,
        BigInt(voucher.periodMinutes),
        voucher.sinkAddress,
      ];
      const hash = await walletClient.deployContract({
        abi,
        args,
        bytecode: bytecode,
      });
      setHash(hash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
      setInfo("Contract deployed");
      setReceipt(receipt);
      if (receipt.contractAddress === undefined) {
        setLoading(false);
        setError(Error("No contract address"));
        return;
      }
      setInfo("Writing to Token Index and CIC Graph");
      const bodyData: InsertVoucherBody = {
        voucher: {
          ...voucher,
          voucherAddress: getAddress(receipt?.contractAddress as `0x${string}`),
        },
      };

      const response = await fetch("/api/deploy", {
        method: "POST",
        body: stringify(bodyData),
      });
      if (response.status !== 200) {
        try {
          const error = (await response.json()).error;
          setError(new Error(error));
        } catch (_) {
          setError(new Error(response.statusText));
        }
        setLoading(false);
        return;
      }
      setLoading(false);
      options.onComplete?.(receipt);
    },
    [options, publicClient, walletClient]
  );
  return { deploy, info, receipt, error, loading, hash };
};
