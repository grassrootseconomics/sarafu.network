import { useCallback, useState } from "react";
import {
  getAddress,
  isAddress,
  parseUnits,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { type VoucherPublishingSchema } from "~/components/voucher/forms/create-voucher-form/schemas";
import * as dmrContract from "~/contracts/erc20-demurrage-token/contract";
import { config } from "~/lib/web3";
import { api, type RouterOutputs } from "~/utils/api";
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

  const deployContract = async (args: ConstructorArgs) => {
    const hash = await walletClient?.deployContract({
      abi: dmrContract.abi,
      args,
      bytecode: dmrContract.bytecode,
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
      if (input.expiration.type !== "gradual")
        throw Error("Only gradual expiration is supported");
      if (!isAddress(input.expiration.communityFund))
        throw Error("Invalid Community Fund Address");

      setLoading(true);
      setInfo("Deploying contract");

      try {
        const decayLevel = calculateDecayLevel(
          input.expiration.rate / 100,
          BigInt(input.expiration.period)
        );
        const args: ConstructorArgs = [
          input.nameAndProducts.name,
          input.nameAndProducts.symbol,
          6, // decimals
          decayLevel,
          BigInt(input.expiration.period),
          input.expiration.communityFund,
        ];

        setInfo("Waiting for transaction receipt");
        const txReceipt = await waitForReceiptAndSet(
          await deployContract(args)
        );

        if (!txReceipt.contractAddress) {
          throw new Error("No contract address");
        }
        setInfo("Writing to Token Index and CIC Graph");
        const voucherData = await deployMutation.mutateAsync({
          ...input,
          voucherAddress: getAddress(txReceipt.contractAddress),
          contractVersion: dmrContract.version,
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
      deployContract,
      waitForReceiptAndSet,
      mintTokens,
      options.onSuccess,
    ]
  );

  return { deploy, info, receipt, voucher, loading, hash };
};
