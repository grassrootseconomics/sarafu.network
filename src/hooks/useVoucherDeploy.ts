import { useCallback, useState } from "react";
import {
  getAddress,
  isAddress,
  parseGwei,
  parseUnits,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { type VoucherPublishingSchema } from "~/components/voucher/forms/create-voucher-form/schemas";
import * as dmrContract from "~/contracts/erc20-demurrage-token/contract";
import * as giftableContract from "~/contracts/erc20-giftable-token/contract";

import { config } from "~/lib/web3";
import { api, type RouterOutputs } from "~/utils/api";
import { calculateDecayLevel } from "../utils/dmr-helpers";

export type DMRConstructorArgs = [
  name: string,
  symbol: string,
  decimals: number,
  decay_level: bigint,
  periodMins: bigint,
  sink_address: `0x${string}`,
];
export type GiftableConstructorArgs = [
  name: string,
  symbol: string,
  decimals: number,
  expireTimestamp: bigint,
];
// TODO: Move to the backend
export const useVoucherDeploy = (
  options: {
    onSuccess?: (receipt: TransactionReceipt) => void;
  } = {}
) => {
  const [voucher, setVoucher] = useState<RouterOutputs["voucher"]["deploy"]>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [hash, setHash] = useState<Hash>();
  const deployMutation = api.voucher.deploy.useMutation({
    retry: false,
  });
  const publicClient = usePublicClient({ config });
  const { data: walletClient } = useWalletClient();

  const deployDMRContract = async (args: DMRConstructorArgs) => {
    const hash = await walletClient?.deployContract({
      abi: dmrContract.abi,
      args,
      bytecode: dmrContract.bytecode,
      gas: 7_000_000n,
      maxFeePerGas: parseGwei("10"),
      maxPriorityFeePerGas: 5n,
    });
    if (!hash) {
      throw new Error("Failed to deploy contract");
    }
    setHash(hash);
    return hash;
  };

  const deployGiftableContract = async (args: GiftableConstructorArgs) => {
    const hash = await walletClient?.deployContract({
      abi: giftableContract.abi,
      args: [args[0], args[1], args[2], args[3]],
      bytecode: giftableContract.bytecode,
      gas: 7_000_000n,
      maxFeePerGas: parseGwei("10"),
      maxPriorityFeePerGas: 5n,
    });
    if (!hash) {
      throw new Error("Failed to deploy contract");
    }
    setHash(hash);
    return hash;
  };

  const waitForReceiptAndSet = async (hash: Hash) => {
    const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
    if (!txReceipt.contractAddress || !isAddress(txReceipt.contractAddress)) {
      throw new Error("No valid contract address found");
    }
    setReceipt(txReceipt);
    return txReceipt;
  };

  const mintTokens = async (
    address: `0x${string}`,
    supply: number,
    symbol: string
  ) => {
    const mintHash = await walletClient?.writeContract({
      abi: dmrContract.abi,
      address,
      functionName: "mintTo",
      args: [walletClient.account.address, parseUnits(supply.toString(), 6)],
    });
    if (!mintHash) {
      throw Error("No mint hash");
    }
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    setInfo(`Minted ${supply} ${symbol}`);
  };

  const deploy = useCallback(
    async (input: Omit<VoucherPublishingSchema, "voucherAddress">) => {
      if (!walletClient) throw Error("No wallet client");
      if (!["gradual", "none"].includes(input.expiration.type))
        throw Error("Only gradual or no expiration is supported");

      setLoading(true);
      setInfo("Deploying contract");
      let txReceipt: TransactionReceipt;
      try {
        if (input.expiration.type === "gradual") {
          if (!isAddress(input.expiration.communityFund))
            throw Error("Invalid Community Fund Address");
          const decayLevel = calculateDecayLevel(
            input.expiration.rate / 100,
            BigInt(input.expiration.period)
          );
          const args: DMRConstructorArgs = [
            input.nameAndProducts.name,
            input.nameAndProducts.symbol,
            6, // decimals
            decayLevel,
            BigInt(input.expiration.period),
            input.expiration.communityFund,
          ];

          setInfo("Waiting for transaction receipt");
          txReceipt = await waitForReceiptAndSet(await deployDMRContract(args));
        } else if (input.expiration.type === "none") {
          const args: GiftableConstructorArgs = [
            input.nameAndProducts.name,
            input.nameAndProducts.symbol,
            6, // decimals
            BigInt(0),
          ];
          setInfo("Waiting for transaction receipt");
          txReceipt = await waitForReceiptAndSet(
            await deployGiftableContract(args)
          );
        } else {
          throw Error("Invalid Contract Type");
        }

        if (!txReceipt.contractAddress) {
          throw new Error("No contract address");
        }
        setInfo("Writing to Token Index and CIC Graph");
        const voucherData = await deployMutation.mutateAsync({
          ...input,
          voucherAddress: getAddress(txReceipt.contractAddress),
          contractVersion:
            input.expiration.type === "gradual"
              ? dmrContract.version
              : giftableContract.version,
          type:
            input.expiration.type === "gradual"
              ? dmrContract.type
              : giftableContract.type,
        });
        setVoucher(voucherData);

        setInfo(
          `Please Approve the transaction in your wallet to mint ${input.valueAndSupply.supply} ${input.nameAndProducts.symbol}`
        );
        await mintTokens(
          txReceipt.contractAddress,
          input.valueAndSupply.supply,
          input.nameAndProducts.symbol
        );
        setInfo("Deployment complete! Please wait while we redirect you.");
        options.onSuccess?.(txReceipt); // Updated to handle potential state delay
      } finally {
        setLoading(false);
      }
    },
    [
      walletClient,
      publicClient,
      deployMutation,
      deployDMRContract,
      deployGiftableContract,
      waitForReceiptAndSet,
      mintTokens,
      options.onSuccess,
    ]
  );

  return { deploy, info, receipt, voucher, loading, hash };
};
