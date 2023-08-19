import {
  createPublicClient,
  createWalletClient,
  http,
  toHex,
  type HttpTransport,
  type PrivateKeyAccount,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "~/contracts/erc20-token-index/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";

type ChainType = ReturnType<typeof getViemChain>;

export class TokenIndex {
  private address: `0x${string}`;
  private _walletClient: WalletClient<
    HttpTransport,
    ChainType,
    PrivateKeyAccount
  >;
  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor() {
    this.address = env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS;

    const { TOKEN_INDEX_WRITER_PRIVATE_KEY } = env;
    const tokenIndexWriterAccount = privateKeyToAccount(
      TOKEN_INDEX_WRITER_PRIVATE_KEY as `0x${string}`
    );

    // Initialize clients
    const config = { chain: getViemChain(), transport: http() };

    this._walletClient = createWalletClient({
      account: tokenIndexWriterAccount,
      ...config,
    });

    this.publicClient = createPublicClient(config);
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async add(voucherAddress: `0x${string}`) {
    const hash = await this._walletClient.writeContract({
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

  async remove(voucherAddress: `0x${string}`) {
    const hash = await this._walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "remove",
      args: [voucherAddress],
    });
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
}
