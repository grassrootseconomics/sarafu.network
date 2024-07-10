import { type Address, type HttpTransport, type PublicClient } from "viem";
import { type getViemChain } from "~/lib/web3";
import { getWriterWalletClient } from "../writer";
import { limiterAbi, limiterBytecode } from "./contract";

type ChainType = ReturnType<typeof getViemChain>;

export class Limiter {
  public readonly publicClient: PublicClient<HttpTransport, ChainType>;
  address: Address;

  constructor(
    publicClient: PublicClient<HttpTransport, ChainType>,
    address: Address
  ) {
    this.publicClient = publicClient;
    this.address = address;
  }

  static async deploy({
    publicClient,
  }: {
    publicClient: PublicClient<HttpTransport, ChainType>;
  }) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.deployContract({
      abi: limiterAbi,
      bytecode: limiterBytecode,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error("Failed to deploy limiter");
    }
    return new Limiter(publicClient, receipt.contractAddress);
  }

  async limitOf(token: Address, holder: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: limiterAbi,
      functionName: "limitOf",
      args: [token, holder],
    });
  }

  async owner(): Promise<Address> {
    return this.publicClient.readContract({
      address: this.address,
      abi: limiterAbi,
      functionName: "owner",
    });
  }

  async setLimit(token: Address, value: bigint): Promise<void> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.sendTransaction({
      to: this.address,
      abi: limiterAbi,
      functionName: "setLimit",
      args: [token, value],
    });
    await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
  }

  async setLimitFor(
    token: Address,
    holder: Address,
    value: bigint
  ): Promise<void> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.sendTransaction({
      to: this.address,
      abi: limiterAbi,
      functionName: "setLimitFor",
      args: [token, holder, value],
    });
    await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
  }

  async supportsInterface(sum: `0x${string}`): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.address,
      abi: limiterAbi,
      functionName: "supportsInterface",
      args: [sum],
    });
  }

  async transferOwnership(newOwner: Address): Promise<boolean> {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      address: this.address,
      abi: limiterAbi,
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
