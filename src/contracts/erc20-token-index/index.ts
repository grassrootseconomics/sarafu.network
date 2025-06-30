import {
  type Chain,
  hexToNumber,
  parseGwei,
  type PublicClient,
  toHex,
  type Transport,
} from "viem";
import {
  tokenIndexABI,
  tokenIndexBytecode,
} from "~/contracts/erc20-token-index/contract";
import { getWriterWalletClient } from "../writer";

export class TokenIndex<t extends Transport, c extends Chain> {
  address: `0x${string}`;

  publicClient: PublicClient<t, c>;
  contract: { address: `0x${string}`; abi: typeof tokenIndexABI };

  constructor(publicClient: PublicClient<t, c>, address: `0x${string}`) {
    if (!publicClient) {
      throw new Error("publicClient is required");
    }
    this.address = address;
    this.contract = { address: this.address, abi: tokenIndexABI } as const;
    this.publicClient = publicClient;
  }

  getAddress(): `0x${string}` {
    return this.address;
  }
  static async deploy<t extends Transport, c extends Chain>(
    publicClient: PublicClient<t, c>
  ) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.deployContract({
      abi: tokenIndexABI,
      bytecode: tokenIndexBytecode,
      gas: 2_500_000n,
      maxFeePerGas: parseGwei("27"),
      maxPriorityFeePerGas: 5n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error("Failed to deploy token index");
    }
    return new TokenIndex(publicClient, receipt.contractAddress);
  }
  async add(voucherAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();

    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "add",
      args: [voucherAddress],
    });
    console.debug("addVoucher tx: ", hash);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }

  async addressOf(symbol: string) {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "addressOf",
      args: [toHex(symbol, { size: 32 })],
    });
  }
  async getAllVouchers() {
    const entryCount = await this.entryCount();
    const vouchers: Promise<`0x${string}`>[] = [];

    if (entryCount) {
      for (let i = 0; i < entryCount; i++) {
        vouchers.push(this.entry(BigInt(i)));
      }
    }
    return Promise.all(vouchers);
  }
  async entryCount() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "entryCount",
    });
  }
  async entry(index: bigint) {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "entry",
      args: [index],
    });
  }
  async has(address: `0x${string}`) {
    try {
      return this.publicClient.readContract({
        ...this.contract,
        functionName: "have",
        args: [address],
      });
    } catch (error) {
      console.error(error);
      // Old contract has no have function, so we use has instead
      return this.publicClient.readContract({
        ...this.contract,
        abi: [
          {
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "has",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "has",
        args: [address],
      });
    }
  }
  async exists(symbol: string) {
    const address = await this.addressOf(symbol);
    const exists = hexToNumber(address) !== 0;
    return exists;
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
  async remove(voucherAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "remove",
      args: [voucherAddress],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return receipt.status === "success";
  }
}
