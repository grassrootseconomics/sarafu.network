import {
  parseGwei,
  parseUnits,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem";
import { getWriterWalletClient } from "../writer";
import { abi, bytecode } from "./contract";

interface GiftableConstructorArgs {
  name: string;
  symbol: string;
  expireTimestamp: bigint;
}

export type GiftableContractArgs = [
  name: string,
  symbol: string,
  decimals: number,
  expireTimestamp: bigint,
];
export class GiftableToken<t extends Transport, c extends Chain> {
  address: `0x${string}`;

  publicClient: PublicClient<t, c>;
  contract: { address: `0x${string}`; abi: typeof abi };
  private _decimals: number | undefined;
  constructor(publicClient: PublicClient<t, c>, address: `0x${string}`) {
    if (!publicClient) {
      throw new Error("publicClient is required");
    }
    this.address = address;
    this.contract = { address: this.address, abi: abi } as const;
    this.publicClient = publicClient;
  }
  static async deploy<t extends Transport, c extends Chain>(
    publicClient: PublicClient<t, c>,
    args: GiftableConstructorArgs
  ) {
    const walletClient = getWriterWalletClient();
    const contract_args: GiftableContractArgs = [
      args.name,
      args.symbol,
      6, // decimals
      BigInt(0),
    ];

    const hash = await walletClient.deployContract({
      abi: abi,
      bytecode: bytecode,
      args: contract_args,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error(
        `Failed: Transaction Reverted - ${receipt.transactionHash}`
      );
    }
    return new GiftableToken(publicClient, receipt.contractAddress);
  }
  async getDecimals() {
    if (this._decimals) return this._decimals;
    this._decimals = await this.publicClient.readContract({
      ...this.contract,
      functionName: "decimals",
      args: [],
    });
    return this._decimals;
  }
  async addWriter(writerAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "addWriter",
      args: [writerAddress],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }
  async mintTo(to: `0x${string}`, amount: number) {
    const walletClient = getWriterWalletClient();
    const decimals = await this.getDecimals();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "mintTo",
      gas: 350_000n,
      maxFeePerGas: parseGwei("27"),
      maxPriorityFeePerGas: 5n,
      args: [to, parseUnits(amount.toString(), Number(decimals))],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }
  async transferOwnership(newOwner: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "transferOwnership",
      args: [newOwner],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }
}
