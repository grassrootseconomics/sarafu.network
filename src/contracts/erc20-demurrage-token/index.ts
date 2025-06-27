import {
  parseGwei,
  parseUnits,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem";
import { calculateDecayLevel } from "~/utils/dmr-helpers";
import { getWriterWalletClient } from "../writer";
import { abi, bytecode } from "./contract";

interface DMRConstructorArgs {
  name: string;
  symbol: string;
  expiration_rate: number;
  expiration_period: number;
  sink_address: `0x${string}`;
}

export type DMRContractArgs = [
  name: string,
  symbol: string,
  decimals: number,
  decay_level: bigint,
  periodMins: bigint,
  sink_address: `0x${string}`,
];
export class DMRToken<t extends Transport, c extends Chain> {
  address: `0x${string}`;

  publicClient: PublicClient<t, c>;
  contract: { address: `0x${string}`; abi: typeof abi };
  private _decimals: bigint | undefined;
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
    args: DMRConstructorArgs
  ) {
    const walletClient = getWriterWalletClient();
    const decayLevel = calculateDecayLevel(
      args.expiration_rate / 100,
      BigInt(args.expiration_period)
    );
    const contract_args: DMRContractArgs = [
      args.name,
      args.symbol,
      6, // decimals
      decayLevel,
      BigInt(args.expiration_period),
      args.sink_address,
    ];

    const hash = await walletClient.deployContract({
      abi: abi,
      bytecode: bytecode,
      args: contract_args,
      gas: 350_000n,
      maxFeePerGas: parseGwei("27"),
      maxPriorityFeePerGas: 5n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error("Failed to Deploy Contract");
    }
    return new DMRToken(publicClient, receipt.contractAddress);
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
