import {
  createPublicClient,
  createWalletClient,
  http,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "~/contracts/eth-accounts-index/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";

type ChainType = ReturnType<typeof getViemChain>;

const config = { chain: getViemChain(), transport: http() };

export class EthAccountsIndex {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor() {
    this.address = env.NEXT_PUBLIC_ETH_ACCOUNTS_INDEX_ADDRESS;
    this.publicClient = createPublicClient(config);
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async add(accountAddress: `0x${string}`) {
    const walletClient = getWalletClient();

    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "add",
      args: [accountAddress],
    });
    console.debug("addAccount tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  async remove(accountAddress: `0x${string}`) {
    const walletClient = getWalletClient();
    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "remove",
      args: [accountAddress],
    });
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  async isActive(accountAddress: `0x${string}`) {
    return this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "isActive",
      args: [accountAddress],
    });
  }

  // Add other methods based on the contract ABI as needed...
}

function getWalletClient() {
  const { ETH_ACCOUNTS_INDEX_WRITER_PRIVATE_KEY } = env;
  const ethAccountsIndexWriterAccount = privateKeyToAccount(
    ETH_ACCOUNTS_INDEX_WRITER_PRIVATE_KEY as `0x${string}`
  );
  return createWalletClient({
    account: ethAccountsIndexWriterAccount,
    ...config,
  });
}