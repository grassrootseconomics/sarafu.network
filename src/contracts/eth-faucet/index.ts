import {
  createPublicClient,
  createWalletClient,
  http,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "~/contracts/eth-faucet/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";

type ChainType = ReturnType<typeof getViemChain>;

const config = { chain: getViemChain(), transport: http() };

export class EthFaucet {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor() {
    this.address = env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS;
    this.publicClient = createPublicClient(config);
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async gimme() {
    const walletClient = getWalletClient();

    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "gimme"
    });
    console.debug("gimme tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  async giveTo(recipientAddress: `0x${string}`) {
    const walletClient = getWalletClient();
    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "giveTo",
      args: [recipientAddress],
    });
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  // Add other methods based on the contract ABI as needed...
}

function getWalletClient() {
  const { ETH_FAUCET_WRITER_PRIVATE_KEY } = env;
  const ethFaucetWriterAccount = privateKeyToAccount(
    ETH_FAUCET_WRITER_PRIVATE_KEY as `0x${string}`
  );
  return createWalletClient({
    account: ethFaucetWriterAccount,
    ...config,
  });
}