import {
  hexToNumber,
  toHex,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { tokenIndexABI } from "~/contracts/erc20-token-index/contract";
import { env } from "~/env.mjs";
import { type getViemChain } from "~/lib/web3";
import { getWriterWalletClient } from "../writer";

type ChainType = ReturnType<typeof getViemChain>;

export class TokenIndex {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;
  contract: { address: `0x${string}`; abi: typeof tokenIndexABI };

  constructor(publicClient: PublicClient<HttpTransport, ChainType>, address?: `0x${string}`) {
    this.address = address ?? env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS;
    this.contract = { address: this.address, abi: tokenIndexABI } as const;
    this.publicClient = publicClient;
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async add(voucherAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();

    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "add",
      args: [voucherAddress],
    });
    console.debug("addVoucher tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({ hash });
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
  async exists(symbol: string) {
    const address = await this.addressOf(symbol);
    const exists = hexToNumber(address) !== 0;
    return exists;
  }

  async remove(voucherAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "remove",
      args: [voucherAddress],
    });
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
}
