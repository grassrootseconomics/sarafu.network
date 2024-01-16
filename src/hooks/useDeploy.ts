import { useCallback, useState } from "react";
import {
  BaseError,
  getAddress,
  isAddress,
  parseUnits,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useToast } from "~/components/ui/use-toast";
import { type VoucherPublishingSchema } from "~/components/voucher/forms/create-voucher-form/schemas";
import * as dmrContract from "~/contracts/erc20-demurrage-token/contract";
import { config } from "~/lib/web3";
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
    onSuccess?: (receipt: TransactionReceipt) => void;
  } = {}
) => {
  const [voucher, setVoucher] =
    useState<Awaited<ReturnType<typeof mutation.mutateAsync>>>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [loading, setLoading] = useState<boolean>(false);
  const [info, setInfo] = useState<string>();
  const mutation = api.voucher.deploy.useMutation();
  const toast = useToast();
  const [hash, setHash] = useState<Hash>();
  const publicClient = usePublicClient({
    config: config,
  });

  const { data: walletClient } = useWalletClient();
  const showError = (message: string) =>
    toast.toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  const deploy = useCallback(
    async (input: Omit<VoucherPublishingSchema, "voucherAddress">) => {
      if (input.expiration.type !== "gradual") {
        showError("Only gradual expiration is supported");
        return;
      }
      try {
        if (!walletClient) {
          showError("No wallet client");
          return;
        }
        if (!isAddress(input.expiration.communityFund)) {
          showError("Invalid Community Fund Address");
          return;
        }
        setLoading(true);
        setInfo("Deploying contract");
        const decay_level = calculateDecayLevel(
          input.expiration.rate / 100,
          BigInt(input.expiration.period)
        );
        const decimals = 6;
        const args: ConstructorArgs = [
          input.nameAndProducts.name,
          input.nameAndProducts.symbol,
          decimals,
          decay_level,
          BigInt(input.expiration.period),
          input.expiration.communityFund,
        ];
        const hash = await walletClient.deployContract({
          abi: dmrContract.abi,
          args,
          bytecode: dmrContract.bytecode,
        });

        setHash(hash);

        setInfo("Waiting for Transaction Receipt");
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
        });
        if (!receipt.contractAddress || !isAddress(receipt.contractAddress)) {
          setLoading(false);
          showError("No contract address");
          return;
        }
        setReceipt(receipt);
        const checksummedAddress = getAddress(receipt.contractAddress);
        setInfo("Writing to Token Index and CIC Graph");
        const v = await mutation.mutateAsync({
          ...input,
          voucherAddress: checksummedAddress,
          contractVersion: dmrContract.version,
        });
        setInfo(
          `Minting ${input.valueAndSupply.supply} ${input.nameAndProducts.symbol} to ${walletClient.account.address}}`
        );
        const mintHash = await walletClient.writeContract({
          abi: dmrContract.abi,
          address: checksummedAddress,
          functionName: "mintTo",
          args: [
            walletClient.account.address,
            parseUnits(input.valueAndSupply.supply.toString(), decimals),
          ],
        });
        await publicClient.waitForTransactionReceipt({
          hash: mintHash,
        });
        setVoucher(v);

        setInfo("Done");
        setLoading(false);
      } catch (e) {
        if (e instanceof BaseError) {
          showError(e.shortMessage);
        } else {
          showError("Something went wrong");
          console.error(e);
        }
        setLoading(false);
        return;
      }
    },
    [options, publicClient, walletClient]
  );
  return { deploy, info, receipt, voucher, loading, hash };
};
