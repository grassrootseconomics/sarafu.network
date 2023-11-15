import {
  createPublicClient,
  hexToNumber,
  http,
  toHex,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { abi } from "~/contracts/erc20-token-index/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";
import { getWriterWalletClient } from "../writer";

type ChainType = ReturnType<typeof getViemChain>;

const config = { chain: getViemChain(), transport: http() };

export class TokenIndex {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor() {
    this.address = env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS;
    this.publicClient = createPublicClient(config);
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async add(voucherAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();

    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "add",
      args: [voucherAddress],
    });
    console.debug("addVoucher tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  async addressOf(symbol: string) {
    return this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "addressOf",
      args: [toHex(symbol, { size: 32 })],
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
      abi,
      address: this.address,
      functionName: "remove",
      args: [voucherAddress],
    });
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
}
