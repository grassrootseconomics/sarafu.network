import {
  parseGwei,
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem";
import { getWriterWalletClient } from "../writer";
import { priceIndexBytecode, priceIndexQuoteAbi } from "./contract";

export class PriceIndexQuote<t extends Transport, c extends Chain> {
  public readonly publicClient: PublicClient<t, c>;
  address: Address;

  constructor(publicClient: PublicClient<t, c>, address: Address) {
    this.publicClient = publicClient;
    this.address = address;
  }

  static async deploy<t extends Transport, c extends Chain>({
    publicClient,
  }: {
    publicClient: PublicClient<t, c>;
  }) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.deployContract({
      abi: priceIndexQuoteAbi,
      bytecode: priceIndexBytecode,
      gas: 2_500_000n,
      maxFeePerGas: parseGwei("27"),
      maxPriorityFeePerGas: 5n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (!receipt.contractAddress) {
      throw new Error("Failed to deploy PriceIndexQuote");
    }
    return new PriceIndexQuote(publicClient, receipt.contractAddress);
  }

  async DEFAULT_EXCHANGE_RATE(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "DEFAULT_EXCHANGE_RATE",
    });
  }

  async owner() {
    return this.publicClient.readContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "owner",
    });
  }

  async priceIndex(tokenAddress: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "priceIndex",
      args: [tokenAddress],
    });
  }

  async setPriceIndexValue(
    tokenAddress: Address,
    exchangeRate: bigint
  ): Promise<boolean> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "setPriceIndexValue",
      args: [tokenAddress, exchangeRate],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }

  async supportsInterface(sum: `0x${string}`): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "supportsInterface",
      args: [sum],
    });
  }

  async transferOwnership(newOwner: Address): Promise<boolean> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "transferOwnership",
      args: [newOwner],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }

  async setValueFor(
    outToken: Address,
    inToken: Address,
    value: bigint
  ): Promise<boolean> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      address: this.address,
      abi: priceIndexQuoteAbi,
      functionName: "valueFor",
      args: [outToken, inToken, value],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }
}
